import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from './SquircleAvatar';

export function ConversationItem({ thread, onPress, onLongPress }) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      onPress={() => onPress(thread)}
      onLongPress={() => onLongPress(thread)}
      delayLongPress={350}>
      <SquircleAvatar
        initials={thread.contactName}
        size={50}
        backgroundColor={thread.avatarColor}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.name,
                {
                  color: theme.text,
                  fontWeight: thread.unreadCount > 0 ? '800' : '600',
                },
              ]}
              numberOfLines={1}>
              {thread.contactName}
            </Text>
            {thread.isPinned && (
              <Ionicons
                name="pin"
                size={14}
                color={theme.pinned}
                style={styles.pinIcon}
              />
            )}
          </View>
          <Text
            style={[
              styles.timestamp,
              {
                color: thread.unreadCount > 0 ? theme.primary : theme.textTertiary,
                fontWeight: thread.unreadCount > 0 ? '700' : '500',
              },
            ]}>
            {thread.timestamp}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.preview,
              {
                color: thread.unreadCount > 0 ? theme.text : theme.textSecondary,
                fontWeight: thread.unreadCount > 0 ? '600' : '400',
              },
            ]}
            numberOfLines={1}>
            {thread.lastMessage}
          </Text>
          {thread.unreadCount > 0 && (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: theme.unreadBadge },
              ]}>
              <Text style={styles.unreadBadgeText}>
                {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.two,
    gap: 4,
  },
  name: {
    fontSize: 16,
    letterSpacing: -0.3,
  },
  pinIcon: {
    marginLeft: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    fontSize: 14,
    flex: 1,
    marginRight: Spacing.two,
    lineHeight: 19,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
