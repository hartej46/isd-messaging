import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function ComposeFAB({ onPress }) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: theme.primary,
          shadowColor: theme.primary,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
      onPress={onPress}
      accessibilityLabel="Compose new message"
      accessibilityRole="button">
      <Ionicons name="create-outline" size={26} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.five,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
});
