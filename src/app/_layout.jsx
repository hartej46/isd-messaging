import { useEffect, useState } from 'react';
import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from 'expo-router';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';

preventAutoHideAsync();

/** @param {{ isDark: boolean }} props */
function NavigationProtector({ isDark }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [showLaunchIntro, setShowLaunchIntro] = useState(Platform.OS === 'android');
  const [launchOverlayOpacity] = useState(() => new Animated.Value(1));
  const [launchTitleOpacity] = useState(() => new Animated.Value(0));
  const [launchTitleScale] = useState(() => new Animated.Value(1.18));

  useEffect(() => {
    if (isLoading) return;

    hideAsync().catch((err) => {
      console.error('Failed to hide splash screen:', err);
    });

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, isLoading, segments, router]);

  useEffect(() => {
    if (Platform.OS !== 'android' || isLoading || !showLaunchIntro) {
      return undefined;
    }

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(launchTitleOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(launchTitleScale, {
          toValue: 1,
          duration: 620,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(180),
      Animated.timing(launchOverlayOpacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setShowLaunchIntro(false);
      }
    });

    return () => animation.stop();
  }, [
    isLoading,
    launchOverlayOpacity,
    launchTitleOpacity,
    launchTitleScale,
    showLaunchIntro,
  ]);

  return (
    <View style={styles.root}>
      <StatusBar style={showLaunchIntro ? 'light' : isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: false,
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="profile" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="compose" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
      {showLaunchIntro ? (
        <Animated.View
          pointerEvents="auto"
          style={[styles.launchOverlay, { opacity: launchOverlayOpacity }]}>
          <Animated.Text
            style={[
              styles.launchTitle,
              {
                opacity: launchTitleOpacity,
                transform: [{ scale: launchTitleScale }],
              },
            ]}>
            Messages
          </Animated.Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

function RootThemeShell() {
  const settingsContext = useSettings();
  const isDark = settingsContext?.resolvedColorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <NavigationProtector isDark={isDark} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <RootThemeShell />
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  launchOverlay: {
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
  launchTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
