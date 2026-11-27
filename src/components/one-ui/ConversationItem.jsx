import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pin, User } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function ConversationItem({
  thread,
  isFirst = false,
  isLast = false,
  onPress,
  onLongPress,
}) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.card,
          borderTopLeftRadius: isFirst ? 26 : 0,
          borderTopRightRadius: isFirst ? 26 : 0,
          borderBottomLeftRadius: isLast ? 26 : 0,
          borderBottomRightRadius: isLast ? 26 : 0,
        },
      ]}
      onPress={() => onPress(thread)}
      onLongPress={() => onLongPress(thread)}
      delayLongPress={350}>
      <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
        <User size={22} color="#FFFFFF" strokeWidth={2.1} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.name,
                {
                  color: theme.text,
                  fontWeight: thread.unreadCount > 0 ? '700' : '600',
                },
              ]}
              numberOfLines={1}>
              {thread.contactName}
            </Text>
            {thread.isPinned ? (
              <Pin size={13} color={theme.primary} strokeWidth={2.2} />
            ) : null}
          </View>
          <Text
            style={[
              styles.timestamp,
              {
                color: thread.unreadCount > 0 ? theme.primary : theme.textTertiary,
                fontWeight: thread.unreadCount > 0 ? '700' : '400',
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
            numberOfLines={2}>
            {thread.lastMessage}
          </Text>
          {thread.unreadCount > 0 ? (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: theme.unreadBadge },
              ]}>
              <Text style={styles.unreadBadgeText}>
                {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: 13,
    gap: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.two,
    gap: 5,
  },
  name: {
    fontSize: 16,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  preview: {
    fontSize: 13.5,
    flex: 1,
    marginRight: Spacing.two,
    lineHeight: 18,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginTop: 2,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
