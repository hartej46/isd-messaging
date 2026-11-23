/**
 * One UI design system tokens for SMS & Messaging
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111215',
    textSecondary: '#6E7380',
    textTertiary: '#9DA2B0',
    background: '#FFFFFF',
    backgroundElement: '#F2F4F7',
    backgroundSelected: '#E3E7EE',
    card: '#FFFFFF',
    cardSubtle: '#F6F7FA',
    border: '#E8EAEE',
    borderLight: '#F0F2F5',
    primary: '#1C68F3', // Signature action blue
    primaryDark: '#1254C8',
    primaryLight: '#EBF2FE',
    outgoingBubble: '#1C68F3',
    outgoingBubbleText: '#FFFFFF',
    incomingBubble: '#ECEEF2',
    incomingBubbleText: '#15161A',
    unreadBadge: '#1C68F3',
    unreadBadgeText: '#FFFFFF',
    inputBackground: '#F0F2F6',
    inputBorder: '#E2E5EB',
    danger: '#E53935',
    success: '#10B981',
    pinned: '#F59E0B',
  },
  dark: {
    text: '#F5F6F8',
    textSecondary: '#9AA0AD',
    textTertiary: '#646875',
    background: '#0B0C0E',
    backgroundElement: '#1A1C21',
    backgroundSelected: '#252830',
    card: '#16181D',
    cardSubtle: '#1F2128',
    border: '#2A2D36',
    borderLight: '#21232B',
    primary: '#2F7BF6',
    primaryDark: '#1B64E0',
    primaryLight: '#182A48',
    outgoingBubble: '#2F7BF6',
    outgoingBubbleText: '#FFFFFF',
    incomingBubble: '#252830',
    incomingBubbleText: '#F5F6F8',
    unreadBadge: '#2F7BF6',
    unreadBadgeText: '#FFFFFF',
    inputBackground: '#1C1E24',
    inputBorder: '#2E323D',
    danger: '#EF4444',
    success: '#34D399',
    pinned: '#FBBF24',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
};

export const BorderRadius = {
  small: 8,
  medium: 14,
  card: 20,
  squircle: 22,
  large: 26,
  bubble: 18,
  pill: 9999,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
