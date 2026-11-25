import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

export function ChatOptionsModal({
  visible,
  thread,
  onClose,
  onTogglePin,
  onClearHistory,
  onDeleteThread,
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
            styles.menuCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}>
          <View style={styles.menuHeader}>
            <Text style={[styles.menuTitle, { color: theme.textSecondary }]}>
              CONVERSATION
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}
            onPress={() => {
              onTogglePin();
              onClose();
            }}>
            <Ionicons
              name={thread.isPinned ? 'pin' : 'pin-outline'}
              size={20}
              color={thread.isPinned ? theme.pinned : theme.text}
            />
            <Text style={[styles.menuItemText, { color: theme.text }]}>
              {thread.isPinned ? 'Unpin conversation' : 'Pin to top'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}
            onPress={() => {
              onClearHistory();
              onClose();
            }}>
            <Ionicons name="backspace-outline" size={20} color={theme.text} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>
              Clear messages
            </Text>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: `${theme.danger}15` },
            ]}
            onPress={() => {
              onDeleteThread();
              onClose();
            }}>
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
            <Text style={[styles.menuItemText, { color: theme.danger }]}>
              Delete conversation
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 58,
    paddingRight: Spacing.three,
  },
  menuCard: {
    width: 230,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  menuHeader: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  menuTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.medium,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.one,
  },
});
