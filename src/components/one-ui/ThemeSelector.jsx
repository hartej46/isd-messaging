import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Moon, Smartphone, Sun } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

const THEME_MODES = [
  { id: 'system', label: 'System', Icon: Smartphone },
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
];

export function ThemeSelector({ value, onChange, pillStyle = false }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {THEME_MODES.map(({ id, label, Icon }) => {
        const isSelected = value === id;
        return (
          <Pressable
            key={id}
            style={[
              styles.option,
              {
                backgroundColor: isSelected
                  ? theme.primary
                  : theme.backgroundElement,
                borderColor: isSelected ? theme.primary : theme.border,
                borderRadius: pillStyle ? BorderRadius.pill : BorderRadius.medium,
              },
            ]}
            onPress={() => onChange(id)}>
            <Icon
              size={16}
              color={isSelected ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? '#FFFFFF' : theme.text,
                  fontWeight: isSelected ? '700' : '600',
                },
              ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
  },
});
