import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from './SquircleAvatar';

export function ThreadActionModal({
  visible,
  thread,
  onClose,
  onTogglePin,
  onToggleRead,
  onDelete,
}) {
  const theme = useTheme();

  if (!thread) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}>

          <View style={styles.headerRow}>
            <SquircleAvatar
              initials={thread.contactName}
              size={44}
              backgroundColor={thread.avatarColor}
            />
            <View style={styles.headerInfo}>
              <Text style={[styles.contactName, { color: theme.text }]}>
                {thread.contactName}
              </Text>
              <Text style={[styles.phoneNumber, { color: theme.textSecondary }]}>
                {thread.phoneNumber || 'SMS'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <View style={styles.actionsList}>

            <Pressable
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { backgroundColor: theme.backgroundElement },
              ]}
              onPress={() => {
                onTogglePin(thread.id);
                onClose();
              }}>
              <Ionicons
                name={thread.isPinned ? 'pin' : 'pin-outline'}
                size={20}
                color={thread.isPinned ? theme.pinned : theme.text}
              />
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                {thread.isPinned ? 'Unpin conversation' : 'Pin to top'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { backgroundColor: theme.backgroundElement },
              ]}
              onPress={() => {
                onToggleRead(thread.id);
                onClose();
              }}>
              <Ionicons
                name={
                  thread.unreadCount > 0
                    ? 'mail-open-outline'
                    : 'mail-unread-outline'
                }
                size={20}
                color={theme.text}
              />
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                {thread.unreadCount > 0 ? 'Mark as read' : 'Mark as unread'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { backgroundColor: `${theme.danger}15` },
              ]}
              onPress={() => {
                onDelete(thread.id);
                onClose();
              }}>
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
              <Text style={[styles.actionLabel, { color: theme.danger }]}>
                Delete conversation
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.cancelBtn,
              { backgroundColor: theme.backgroundElement },
            ]}
            onPress={onClose}>
            <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: Spacing.three,
  },
  sheet: {
    borderRadius: BorderRadius.large,
    padding: Spacing.four,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '700',
  },
  phoneNumber: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  actionsList: {
    gap: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: BorderRadius.medium,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    height: 48,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
