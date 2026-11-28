import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { EllipsisVertical, Search } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function HomeHeader({
  title,
  scrollY,
  searchOpen,
  onToggleSearch,
  onOpenMenu,
}) {
  const theme = useTheme();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 110],
    outputRange: [158, 52],
    extrapolate: 'clamp',
  });

  const bigTitleOpacity = scrollY.interpolate({
    inputRange: [0, 65],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [60, 105],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: headerHeight,
          backgroundColor: theme.backgroundElement,
        },
      ]}>
      <Animated.View
        style={[styles.expandedTitleWrap, { opacity: bigTitleOpacity }]}
        pointerEvents="none">
        <Text style={[styles.expandedTitle, { color: theme.text }]}>
          {title}
        </Text>
      </Animated.View>

      <View style={styles.topActionBar}>
        <Animated.Text
          style={[
            styles.compactTitle,
            { color: theme.text, opacity: compactTitleOpacity },
          ]}>
          {title}
        </Animated.Text>

        <View style={styles.topIconsGroup}>
          <Pressable
            onPress={onToggleSearch}
            hitSlop={10}
            style={({ pressed }) => [
              styles.headerIconBtn,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityLabel="Search">
            <Search
              size={22}
              color={searchOpen ? theme.primary : theme.text}
              strokeWidth={2}
            />
          </Pressable>
          <Pressable
            onPress={onOpenMenu}
            hitSlop={10}
            style={({ pressed }) => [
              styles.headerIconBtn,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityLabel="More options">
            <EllipsisVertical size={22} color={theme.text} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.three + 2,
    overflow: 'hidden',
  },
  expandedTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 34,
    alignItems: 'center',
  },
  expandedTitle: {
    fontSize: 34,
    fontWeight: '400',
    letterSpacing: -0.6,
  },
  topActionBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: 21,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  topIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
