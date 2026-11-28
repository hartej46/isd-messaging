import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';

import { SquircleAvatar } from '@/components/one-ui/SquircleAvatar';
import { useNotifications } from '@/context/NotificationContext';
import { useTheme } from '@/hooks/use-theme';

export function NotificationBanner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const notifications = useNotifications();
  const activeNotification = notifications?.activeNotification || null;
  const dismissNotification = notifications?.dismissNotification;

  const [translateY] = useState(() => new Animated.Value(-140));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (activeNotification) {
      translateY.setValue(-140);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 90,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeNotification, opacity, translateY]);

  if (!activeNotification) return null;

  const handleOpen = () => {
    const targetId = activeNotification.threadId;
    dismissNotification?.();
    if (targetId && targetId !== 'demo') {
      router.push(`/chat/${targetId}`);
    }
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          top: Math.max(insets.top + 8, 16),
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [
          styles.banner,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: '#000000',
          },
          pressed && { opacity: 0.92 },
        ]}>
        <SquircleAvatar
          name={activeNotification.senderName}
          color={activeNotification.avatarColor}
          avatarUrl={activeNotification.avatarUrl}
          size={44}
        />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text
              numberOfLines={1}
              style={[styles.senderName, { color: theme.text }]}>
              {activeNotification.senderName}
            </Text>
            <Text style={[styles.timeText, { color: theme.primary }]}>
              {activeNotification.timestamp}
            </Text>
          </View>
          <Text
            numberOfLines={2}
            style={[styles.messageText, { color: theme.textSecondary }]}>
            {activeNotification.messageText}
          </Text>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            dismissNotification?.();
          }}
          hitSlop={10}
          style={styles.closeBtn}>
          <X size={16} color={theme.textTertiary} strokeWidth={2.2} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 999,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 10,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    alignSelf: 'flex-start',
  },
});
