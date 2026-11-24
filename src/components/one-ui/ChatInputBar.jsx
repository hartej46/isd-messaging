import React, { useState } from 'react';
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
  'Sounds good 👍',
  'Call you right back',
  'Running 5 mins late',
];

export function ChatInputBar({ value, onChangeText, onSend, isSending }) {
  const theme = useTheme();
  const [trayOpen, setTrayOpen] = useState(false);

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
          backgroundColor: theme.card,
          borderTopColor: theme.borderLight,
        },
      ]}>
      {/* Expandable Quick Action / Attachment Tray */}
      {trayOpen ? (
        <View
          style={[
            styles.trayContainer,
            { backgroundColor: theme.cardSubtle, borderColor: theme.border },
          ]}>
          <View style={styles.attachmentRow}>
            <Pressable
              style={styles.attachmentItem}
              onPress={() => handleQuickOption('📷 [Photo attachment]')}>
              <View
                style={[styles.attachmentIcon, { backgroundColor: '#E11D4818' }]}>
                <Ionicons name="image-outline" size={20} color="#E11D48" />
              </View>
              <Text style={[styles.attachmentLabel, { color: theme.textSecondary }]}>
                Gallery
              </Text>
            </Pressable>

            <Pressable
              style={styles.attachmentItem}
              onPress={() => handleQuickOption('📍 [Shared current location]')}>
              <View
                style={[styles.attachmentIcon, { backgroundColor: '#05966918' }]}>
                <Ionicons name="location-outline" size={20} color="#059669" />
              </View>
              <Text style={[styles.attachmentLabel, { color: theme.textSecondary }]}>
                Location
              </Text>
            </Pressable>

            <Pressable
              style={styles.attachmentItem}
              onPress={() => handleQuickOption('🎤 [Voice message 0:08]')}>
              <View
                style={[styles.attachmentIcon, { backgroundColor: '#7C3AED18' }]}>
                <Ionicons name="mic-outline" size={20} color="#7C3AED" />
              </View>
              <Text style={[styles.attachmentLabel, { color: theme.textSecondary }]}>
                Voice
              </Text>
            </Pressable>

            <Pressable
              style={styles.attachmentItem}
              onPress={() => handleQuickOption('📅 Let us schedule a time to catch up.')}>
              <View
                style={[styles.attachmentIcon, { backgroundColor: '#2563EB18' }]}>
                <Ionicons name="calendar-outline" size={20} color="#2563EB" />
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

      {/* Main Input Pill Bar */}
      <View style={styles.barRow}>
        <Pressable
          style={({ pressed }) => [
            styles.plusBtn,
            {
              backgroundColor: trayOpen ? theme.primary : theme.backgroundElement,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => setTrayOpen((prev) => !prev)}
          accessibilityLabel="Toggle attachments and quick replies">
          <Ionicons
            name={trayOpen ? 'close' : 'add'}
            size={22}
            color={trayOpen ? '#FFFFFF' : theme.text}
          />
        </Pressable>

        <View
          style={[
            styles.inputPill,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
            },
          ]}>
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            placeholder="Text message"
            placeholderTextColor={theme.textTertiary}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={1000}
          />

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
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </Pressable>
          ) : (
            <Pressable
              style={styles.micBtn}
              onPress={() => setTrayOpen((prev) => !prev)}
              accessibilityLabel="Voice or quick attachments">
              <Ionicons name="mic-outline" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
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
    gap: Spacing.two,
  },
  plusBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 22,
    borderWidth: 1,
    paddingLeft: Spacing.three,
    paddingRight: 5,
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
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  micBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
});
