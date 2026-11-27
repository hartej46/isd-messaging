import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
  const inputRef = useRef(null);

  const hasText = value.trim().length > 0;

  const handleQuickOption = (text) => {
    setTrayOpen(false);
    onSend(text);
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
      {trayOpen ? (
        <View
          style={[
            styles.trayContainer,
            { backgroundColor: theme.cardSubtle, borderColor: theme.border },
          ]}>
          <View style={styles.attachmentRow}>
            <Pressable
              style={styles.attachmentItem}
              onPress={() => handleQuickOption('[Photo attachment]')}>
              <View
                style={[styles.attachmentIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="image-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.attachmentLabel, { color: theme.textSecondary }]}>
                Gallery
              </Text>
            </Pressable>

            <Pressable
              style={styles.attachmentItem}
              onPress={() => handleQuickOption('[Shared current location]')}>
              <View
                style={[styles.attachmentIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="location-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.attachmentLabel, { color: theme.textSecondary }]}>
                Location
              </Text>
            </Pressable>

            <Pressable
              style={styles.attachmentItem}
              onPress={() => handleQuickOption('[Voice message 0:08]')}>
              <View
                style={[styles.attachmentIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="mic-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.attachmentLabel, { color: theme.textSecondary }]}>
                Voice
              </Text>
            </Pressable>

            <Pressable
              style={styles.attachmentItem}
              onPress={() => handleQuickOption('Let us schedule a time to catch up.')}>
              <View
                style={[styles.attachmentIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="calendar-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.attachmentLabel, { color: theme.textSecondary }]}>
                Schedule
              </Text>
            </Pressable>
          </View>

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

      <View style={styles.barRow}>
        <Pressable
          style={({ pressed }) => [
            styles.leftIconBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => handleQuickOption('[Photo attachment]')}
          hitSlop={6}
          accessibilityLabel="Attach photo from gallery">
          <Ionicons name="image-outline" size={24} color={theme.text} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.leftIconBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => handleQuickOption('[Photo attachment]')}
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
            onPress={() => setTrayOpen((prev) => !prev)}
            hitSlop={6}
            accessibilityLabel="Quick replies and expressions">
            <Ionicons
              name="happy-outline"
              size={22}
              color={trayOpen ? theme.primary : theme.text}
            />
          </Pressable>
        </View>

        {hasText ? (
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              {
                backgroundColor: theme.primary,
                opacity: isSending ? 0.6 : pressed ? 0.85 : 1,
              },
            ]}
            disabled={isSending}
            onPress={() => onSend(value)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  trayContainer: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: Spacing.one,
  },
  attachmentItem: {
    alignItems: 'center',
    gap: 6,
  },
  attachmentIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentLabel: {
    fontSize: 11,
    fontWeight: '600',
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
});
