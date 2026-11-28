import React, { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

export function LaunchIntroOverlay({ isLoading, onVisibilityChange }) {
  const [visible, setVisible] = useState(Platform.OS === 'android');
  const [overlayOpacity] = useState(() => new Animated.Value(1));
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const [titleScale] = useState(() => new Animated.Value(1.18));

  useEffect(() => {
    if (Platform.OS !== 'android' || isLoading || !visible) {
      return undefined;
    }

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(titleScale, {
          toValue: 1,
          duration: 620,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(180),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setVisible(false);
        if (onVisibilityChange) onVisibilityChange(false);
      }
    });

    return () => animation.stop();
  }, [
    isLoading,
    onVisibilityChange,
    overlayOpacity,
    titleOpacity,
    titleScale,
    visible,
  ]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleOpacity,
            transform: [{ scale: titleScale }],
          },
        ]}>
        Messages
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: '#208AEF',
    elevation: 1,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
