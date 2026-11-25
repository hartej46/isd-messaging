import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from './SquircleAvatar';

export function ChatHeader({
  thread,
  onBack,
  onCallPress,
  onVideoPress,
  onMenuPress,
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.background,
          borderBottomColor: theme.borderLight,
        },
      ]}>
      <View style={styles.leftGroup}>
        <Pressable
          onPress={onBack}
          hitSlop={10}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { backgroundColor: theme.backgroundElement },
          ]}
          accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={23} color={theme.text} />
        </Pressable>

        {thread ? (
          <View style={styles.contactRow}>
            <SquircleAvatar
              initials={thread.contactName}
              size={38}
              backgroundColor={thread.avatarColor}
            />
            <View style={styles.contactText}>
              <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
                {thread.contactName}
              </Text>
              <Text style={[styles.contactSub, { color: theme.textSecondary }]} numberOfLines={1}>
                {thread.phoneNumber || 'SMS'}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.rightGroup}>
        <Pressable
          onPress={onCallPress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && { backgroundColor: theme.backgroundElement },
          ]}
          accessibilityLabel="Audio call">
          <Ionicons name="call-outline" size={20} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={onVideoPress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && { backgroundColor: theme.backgroundElement },
          ]}
          accessibilityLabel="Video call">
          <Ionicons name="videocam-outline" size={22} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={onMenuPress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && { backgroundColor: theme.backgroundElement },
          ]}
          accessibilityLabel="More thread options">
          <Ionicons name="ellipsis-vertical" size={19} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.one,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two + 2,
  },
  contactText: {
    flex: 1,
    marginRight: Spacing.two,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  contactSub: {
    fontSize: 12,
    marginTop: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
