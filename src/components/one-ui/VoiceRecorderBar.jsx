import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import { useTheme } from '@/hooks/use-theme';

const DOT_INDICES = Array.from({ length: 14 }, (_, i) => i);

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = String(Math.floor(safe / 60)).padStart(2, '0');
  const secs = String(safe % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function formatShortDuration(totalSeconds) {
  const safe = Math.max(1, Math.round(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = String(safe % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function WaveformIcon({ color }) {
  return (
    <View style={styles.waveIconBox}>
      <View style={[styles.waveIconBar, { height: 6, backgroundColor: color }]} />
      <View style={[styles.waveIconBar, { height: 14, backgroundColor: color }]} />
      <View style={[styles.waveIconBar, { height: 20, backgroundColor: color }]} />
      <View style={[styles.waveIconBar, { height: 12, backgroundColor: color }]} />
      <View style={[styles.waveIconBar, { height: 7, backgroundColor: color }]} />
    </View>
  );
}

function RecordingDots({ primaryColor, mutedColor }) {
  const [dotAnims] = useState(() =>
    DOT_INDICES.map(() => new Animated.Value(0.35))
  );

  useEffect(() => {
    const loops = dotAnims.map((anim, idx) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay((idx % 7) * 90),
          Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.35,
            duration: 320,
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((loop) => loop.start());
    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [dotAnims]);

  return (
    <View style={styles.dotsRow}>
      {dotAnims.map((anim, idx) => {
        const isCenter = idx >= 5 && idx <= 8;
        return (
          <Animated.View
            key={idx}
            style={[
              styles.dot,
              {
                backgroundColor: isCenter ? primaryColor : mutedColor,
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0.35, 1],
                      outputRange: [0.75, 1.35],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export function VoiceRecorderBar({ onCancel, onSendVoice }) {
  const theme = useTheme();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [phase, setPhase] = useState('recording');
  const [recordedUri, setRecordedUri] = useState(null);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const player = useAudioPlayer(recordedUri || null);
  const playerStatus = useAudioPlayerStatus(player);

  const startedAtRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let timer = null;

    async function beginRecording() {
      try {
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(
            'Permission Required',
            'Please allow microphone access to record a voice message.'
          );
          if (isMountedRef.current) onCancel();
          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });

        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        startedAtRef.current = Date.now();

        timer = setInterval(() => {
          if (isMountedRef.current) {
            setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
          }
        }, 250);
      } catch {
        Alert.alert(
          'Microphone Unavailable',
          'Could not start voice recording on this device.'
        );
        if (isMountedRef.current) onCancel();
      }
    }

    beginRecording();

    return () => {
      isMountedRef.current = false;
      if (timer) clearInterval(timer);
      if (audioRecorder.isRecording) {
        audioRecorder.stop().catch(() => {});
      }
    };
  }, [audioRecorder, onCancel]);

  const activeSeconds =
    recorderState.durationMillis > 0
      ? Math.floor(recorderState.durationMillis / 1000)
      : elapsedSeconds;

  const handleStopRecording = async () => {
    const finalSeconds = Math.max(1, activeSeconds);
    try {
      await audioRecorder.stop();
      setRecordedUri(audioRecorder.uri || null);
    } catch {
      setRecordedUri(null);
    }
    setRecordedSeconds(finalSeconds);
    setPhase('preview');
  };

  const handleTogglePreviewPlay = () => {
    if (!recordedUri) return;
    if (playerStatus.playing) {
      player.pause();
    } else {
      if (
        playerStatus.duration > 0 &&
        playerStatus.currentTime >= playerStatus.duration - 0.1
      ) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const handleDiscard = () => {
    if (playerStatus.playing) {
      player.pause();
    }
    onCancel();
  };

  const handleSend = () => {
    if (playerStatus.playing) {
      player.pause();
    }
    const durationLabel = formatShortDuration(recordedSeconds);
    onSendVoice({
      audioUri: recordedUri,
      durationLabel,
    });
  };

  const progressRatio =
    playerStatus.duration > 0
      ? Math.min(1, playerStatus.currentTime / playerStatus.duration)
      : 0;

  if (phase === 'recording') {
    return (
      <View style={styles.row}>
        <View
          style={[
            styles.pill,
            { backgroundColor: theme.inputBackground },
          ]}>
          <Text style={[styles.timerText, { color: theme.text }]}>
            {formatClock(activeSeconds)}
          </Text>
          <RecordingDots
            primaryColor={theme.text}
            mutedColor={theme.textTertiary}
          />
        </View>

        <Pressable
          onPress={handleStopRecording}
          style={({ pressed }) => [
            styles.circleBtn,
            { backgroundColor: theme.inputBackground },
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="Stop voice recording">
          <WaveformIcon color={theme.text} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.pill,
          { backgroundColor: theme.inputBackground },
        ]}>
        <Pressable
          onPress={handleDiscard}
          hitSlop={8}
          style={styles.cancelBtn}
          accessibilityLabel="Discard voice recording">
          <Ionicons name="close" size={22} color={theme.text} />
        </Pressable>

        <Text style={[styles.timerText, { color: theme.text }]}>
          {playerStatus.playing
            ? formatClock(playerStatus.currentTime)
            : formatClock(recordedSeconds)}
        </Text>

        <Pressable
          onPress={handleTogglePreviewPlay}
          hitSlop={8}
          style={styles.playBtn}
          accessibilityLabel={playerStatus.playing ? 'Pause preview' : 'Play preview'}>
          <Ionicons
            name={playerStatus.playing ? 'pause' : 'play'}
            size={18}
            color={theme.textSecondary}
          />
        </Pressable>

        <View style={[styles.trackBg, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.trackFill,
              {
                backgroundColor: theme.primary,
                width: `${Math.round(progressRatio * 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      <Pressable
        onPress={handleSend}
        style={({ pressed }) => [
          styles.circleBtn,
          { backgroundColor: theme.primary },
          pressed && { opacity: 0.85 },
        ]}
        accessibilityLabel="Send voice message">
        <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pill: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  timerText: {
    fontSize: 15,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  dotsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  cancelBtn: {
    padding: 2,
  },
  playBtn: {
    padding: 2,
  },
  trackBg: {
    flex: 1,
    height: 2.5,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveIconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
  },
  waveIconBar: {
    width: 2,
    borderRadius: 1,
  },
});
