import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const TABS = [
  { id: 'messages', label: 'Messages' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'profile', label: 'Profile' },
];

export function BottomNavBar({ activeTab, onSelectTab }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
        },
      ]}>
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            style={({ pressed }) => [
              styles.tabItem,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => onSelectTab(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}>
            <View
              style={[
                styles.labelWrapper,
                isActive && {
                  borderBottomWidth: 2,
                  borderBottomColor: theme.primary,
                },
              ]}>
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? theme.primary : theme.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}>
                {tab.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 52,
    paddingHorizontal: Spacing.three,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelWrapper: {
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
});
