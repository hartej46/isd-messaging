import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from './SquircleAvatar';

export function ChatHeader({
  thread,
  onBack,
  onTitlePress,
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
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </Pressable>

        {thread ? (
          <Pressable
            style={({ pressed }) => [
              styles.contactRow,
              pressed && { opacity: 0.75 },
            ]}
            onPress={onTitlePress || onMenuPress}
            accessibilityLabel="Conversation details">
            <SquircleAvatar
              initials={thread.contactName}
              size={36}
              backgroundColor={thread.avatarColor}
              style={styles.circularAvatar}
            />
            <View style={styles.nameDropdownRow}>
              <Text
                style={[styles.contactName, { color: theme.text }]}
                numberOfLines={1}>
                {thread.contactName}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={theme.textSecondary}
                style={styles.dropdownChevron}
              />
            </View>
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={onMenuPress}
        hitSlop={10}
        style={({ pressed }) => [
          styles.menuBtn,
          pressed && { backgroundColor: theme.backgroundElement },
        ]}
        accessibilityLabel="More thread options">
        <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  circularAvatar: {
    borderRadius: 18,
    shadowOpacity: 0,
    elevation: 0,
  },
  nameDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: Spacing.two,
  },
  contactName: {
    fontSize: 19,
    fontWeight: '500',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  dropdownChevron: {
    marginLeft: 5,
    marginTop: 2,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
