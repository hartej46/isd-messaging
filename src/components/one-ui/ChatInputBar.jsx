import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

const QUICK_REPLIES = [
  'On my way!',
  'Sounds good',
  'Call you right back',
  'Running 5 mins late',
];

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

export function ChatInputBar({ value, onChangeText, onSend, isSending }) {
  const theme = useTheme();
  const [trayOpen, setTrayOpen] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState(null);
  const inputRef = useRef(null);

  const hasText = value.trim().length > 0;
  const canSend = hasText || Boolean(pendingImageUri);

  const handleQuickOption = (text) => {
    setTrayOpen(false);
    setShowQuickReplies(false);
    onSend(text);
  };

  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access to attach an image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setTrayOpen(false);
        setShowQuickReplies(false);
        setPendingImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const handlePickVideo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow media library access to attach a video.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setTrayOpen(false);
        setShowQuickReplies(false);
        onSend('[Video attachment]');
      }
    } catch {
      Alert.alert('Error', 'Could not open video library.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setTrayOpen(false);
        setShowQuickReplies(false);
        setPendingImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Camera Unavailable', 'Camera is not available on this device.');
    }
  };

  const attachmentActions = [
    {
      key: 'quick',
      label: 'Quick response',
      icon: 'chatbox-ellipses',
      color: '#4A90E2',
      onPress: () => setShowQuickReplies((prev) => !prev),
    },
    {
      key: 'schedule',
      label: 'Schedule message',
      icon: 'time',
      color: '#4A90E2',
      onPress: () => handleQuickOption('Let us schedule a time to catch up.'),
    },
    {
      key: 'location',
      label: 'Location',
      icon: 'location',
      color: '#4CAF50',
      onPress: () => handleQuickOption('[Shared current location]'),
    },
    {
      key: 'image',
      label: 'Image',
      icon: 'image',
      color: '#E94E77',
      onPress: handlePickFromGallery,
    },
    {
      key: 'camera',
      label: 'Camera',
      icon: 'camera',
      color: '#0EA5E9',
      onPress: handleTakePhoto,
    },
    {
      key: 'video',
      label: 'Video',
      icon: 'videocam',
      color: '#9C6ADE',
      onPress: handlePickVideo,
    },
    {
      key: 'audio',
      label: 'Audio',
      icon: 'musical-note',
      color: '#6B84E8',
      onPress: () => handleQuickOption('[Voice message 0:08]'),
    },
    {
      key: 'contacts',
      label: 'Contacts',
      icon: 'person',
      color: '#F58231',
      onPress: () => handleQuickOption('[Shared contact card]'),
    },
    {
      key: 'calendar',
      label: 'Calendar',
      icon: 'calendar',
      color: '#2EAD6D',
      onPress: () => handleQuickOption('Let us add this to the calendar.'),
    },
    {
      key: 'notes',
      label: 'Notes',
      icon: 'document-text',
      color: '#F46A25',
      onPress: () => handleQuickOption('[Shared note]'),
    },
    {
      key: 'voice',
      label: 'Voice Recorder',
      icon: 'mic',
      color: '#E55353',
      onPress: () => handleQuickOption('[Voice message 0:08]'),
    },
    {
      key: 'files',
      label: 'My Files',
      icon: 'folder',
      color: '#F4B400',
      onPress: () => handleQuickOption('[Shared file attachment]'),
    },
  ];

  const handleSendPress = () => {
    if (!canSend || isSending) return;
    const attachment = pendingImageUri ? { imageUri: pendingImageUri } : null;
    setPendingImageUri(null);
    onSend(value, attachment);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.borderLight,
        },
      ]}>
      {pendingImageUri ? (
        <View
          style={[
            styles.imagePreviewBar,
            { backgroundColor: theme.cardSubtle, borderColor: theme.border },
          ]}>
          <Image
            source={{ uri: pendingImageUri }}
            style={styles.previewThumb}
            resizeMode="cover"
          />
          <View style={styles.previewMeta}>
            <Text style={[styles.previewTitle, { color: theme.text }]}>
              Photo ready to send
            </Text>
            <Text style={[styles.previewSub, { color: theme.textSecondary }]}>
              Add an optional caption below or tap send
            </Text>
          </View>
          <Pressable
            onPress={() => setPendingImageUri(null)}
            hitSlop={8}
            style={[
              styles.previewRemoveBtn,
              { backgroundColor: theme.backgroundElement },
            ]}
            accessibilityLabel="Remove attached photo">
            <Ionicons name="close" size={16} color={theme.text} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.barRow}>
        <Pressable
          style={({ pressed }) => [
            styles.leftIconBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={handlePickFromGallery}
          hitSlop={6}
          accessibilityLabel="Attach photo from gallery">
          <Ionicons name="image-outline" size={24} color={theme.text} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.leftIconBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={handleTakePhoto}
          hitSlop={6}
          accessibilityLabel="Take photo with camera">
          <Ionicons name="camera-outline" size={25} color={theme.text} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.leftIconBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => setTrayOpen((prev) => !prev)}
          hitSlop={6}
          accessibilityLabel="More attachments">
          <Ionicons
            name={trayOpen ? 'close' : 'add'}
            size={28}
            color={trayOpen ? theme.primary : theme.text}
          />
        </Pressable>

        <View
          style={[
            styles.inputPill,
            {
              backgroundColor: theme.inputBackground,
            },
          ]}>
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { color: theme.text }]}
            placeholder="Message"
            placeholderTextColor={theme.textTertiary}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={1000}
          />

          <Pressable
            style={({ pressed }) => [
              styles.smileyBtn,
              pressed && { opacity: 0.65 },
            ]}
            onPress={() => {
              setTrayOpen(true);
              setShowQuickReplies((prev) => !prev);
            }}
            hitSlop={6}
            accessibilityLabel="Quick replies and expressions">
            <Ionicons
              name="happy-outline"
              size={22}
              color={showQuickReplies ? theme.primary : theme.text}
            />
          </Pressable>
        </View>

        {canSend ? (
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              {
                backgroundColor: theme.primary,
                opacity: isSending ? 0.6 : pressed ? 0.85 : 1,
              },
            ]}
            disabled={isSending}
            onPress={handleSendPress}
            accessibilityLabel="Send message">
            <Ionicons name="arrow-up" size={19} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.rightVoiceBtn,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => handleQuickOption('[Voice message 0:08]')}
            hitSlop={6}
            accessibilityLabel="Send voice message">
            <WaveformIcon color={theme.text} />
          </Pressable>
        )}
      </View>

      {trayOpen ? (
        <View
          style={[
            styles.traySheet,
            { backgroundColor: theme.cardSubtle, borderTopColor: theme.borderLight },
          ]}>
          {showQuickReplies ? (
            <View style={styles.quickSection}>
              <Text style={[styles.quickTitle, { color: theme.textTertiary }]}>
                QUICK RESPONSES
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickChipsRow}>
                {QUICK_REPLIES.map((reply) => (
                  <Pressable
                    key={reply}
                    style={({ pressed }) => [
                      styles.quickChip,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                    onPress={() => handleQuickOption(reply)}>
                    <Text style={[styles.quickChipText, { color: theme.text }]}>
                      {reply}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.gridContainer}>
            {attachmentActions.map((item) => (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.gridItem,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={item.onPress}>
                <View
                  style={[
                    styles.gridCircle,
                    { backgroundColor: theme.card, borderColor: theme.borderLight },
                  ]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.gridLabel, { color: theme.textSecondary }]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  traySheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 0.5,
    marginTop: 10,
    marginHorizontal: -10,
    marginBottom: -10,
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 14,
  },
  quickSection: {
    gap: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 18,
    gap: 7,
  },
  gridCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  gridLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  quickTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginTop: 2,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  quickChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  leftIconBtn: {
    width: 32,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 22,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
    minHeight: 42,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 110,
    paddingTop: 7,
    paddingBottom: 7,
  },
  smileyBtn: {
    width: 32,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  rightVoiceBtn: {
    width: 36,
    height: 42,
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
  imagePreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    gap: 10,
  },
  previewThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  previewMeta: {
    flex: 1,
    gap: 2,
  },
  previewTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  previewSub: {
    fontSize: 12,
  },
  previewRemoveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
