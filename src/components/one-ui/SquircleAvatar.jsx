import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function SquircleAvatar({
  initials = '?',
  size = 48,
  backgroundColor = '#2A9BA5',
  textColor = '#FFFFFF',
  style,
}) {
  const borderRadius = Math.round(size * 0.38);
  const fontSize = Math.round(size * 0.4);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}>
      <Text style={[styles.text, { fontSize, color: textColor }]}>
        {initials.toUpperCase().slice(0, 2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
