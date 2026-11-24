import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

export function CategoryTabs({ tabs, activeTab, onSelectTab }) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: isActive ? theme.primary : theme.backgroundElement,
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
              onPress={() => onSelectTab(tab.id)}>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? '#FFFFFF' : theme.textSecondary,
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}>
                {tab.label}
              </Text>
              {tab.badge !== undefined && tab.badge > 0 && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isActive ? '#FFFFFF' : theme.primary,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isActive ? theme.primary : '#FFFFFF',
                      },
                    ]}>
                    {tab.badge}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: Spacing.one,
  },
  container: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
