import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCheck, LogOut, RefreshCw, Settings } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

export function OverflowMenuModal({
  visible,
  onClose,
  onOpenSettings,
  onMarkAllRead,
  onResetData,
  onSignOut,
}) {
  const theme = useTheme();

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
              OPTIONS
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}
            onPress={() => {
              onOpenSettings();
              onClose();
            }}>
            <Settings size={18} color={theme.text} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>
              Settings
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}
            onPress={() => {
              onMarkAllRead();
              onClose();
            }}>
            <CheckCheck size={18} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>
              Mark all as read
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}
            onPress={() => {
              onResetData();
              onClose();
            }}>
            <RefreshCw size={18} color={theme.text} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>
              Reset demo conversations
            </Text>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: `${theme.danger}15` },
            ]}
            onPress={() => {
              onSignOut();
              onClose();
            }}>
            <LogOut size={18} color={theme.danger} />
            <Text style={[styles.menuItemText, { color: theme.danger }]}>
              Sign out
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
    paddingTop: 60,
    paddingRight: Spacing.four,
  },
  menuCard: {
    width: 240,
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
