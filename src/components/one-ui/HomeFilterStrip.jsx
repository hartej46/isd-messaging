import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const BASE_FILTERS = [{ id: 'all', label: 'All' }];
const EXTRA_FILTERS = [
  { id: 'unread', label: 'Unread' },
  { id: 'starred', label: 'Starred' },
];

export function HomeFilterStrip({
  activeFilter,
  onSelectFilter,
  showExtraFilters,
  onToggleExtraFilters,
}) {
  const theme = useTheme();
  const visibleFilters = showExtraFilters
    ? [...BASE_FILTERS, ...EXTRA_FILTERS]
    : BASE_FILTERS;

  return (
    <View style={styles.strip}>
      {visibleFilters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <Pressable
            key={filter.id}
            style={[
              styles.tab,
              isActive && {
                borderBottomWidth: 2,
                borderBottomColor: theme.primary,
              },
            ]}
            onPress={() => onSelectFilter(filter.id)}>
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? theme.primary : theme.textSecondary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        style={({ pressed }) => [styles.plusBtn, pressed && { opacity: 0.6 }]}
        onPress={onToggleExtraFilters}
        hitSlop={8}
        accessibilityLabel="Toggle category filters">
        <Plus
          size={20}
          color={showExtraFilters ? theme.primary : theme.textSecondary}
          strokeWidth={1.8}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two + 2,
    gap: 18,
  },
  tab: {
    paddingBottom: 3,
  },
  tabText: {
    fontSize: 15,
  },
  plusBtn: {
    padding: 2,
    marginBottom: 2,
  },
});
