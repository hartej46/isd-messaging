import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MessageSquarePlus } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function ComposeFAB({ onPress }) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
      onPress={onPress}
      accessibilityLabel="Compose new message"
      accessibilityRole="button">
      <MessageSquarePlus size={25} color={theme.primary} strokeWidth={2.1} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: 68,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
});
