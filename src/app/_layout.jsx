import { useEffect, useState } from 'react';
import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from 'expo-router';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { LaunchIntroOverlay } from '@/components/one-ui/LaunchIntroOverlay';
import { NotificationBanner } from '@/components/one-ui/NotificationBanner';

preventAutoHideAsync();

function NavigationProtector({ isDark }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [introVisible, setIntroVisible] = useState(Platform.OS === 'android');

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

  return (
    <View style={styles.root}>
      <StatusBar style={introVisible ? 'light' : isDark ? 'light' : 'dark'} />
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
      <LaunchIntroOverlay
        isLoading={isLoading}
        onVisibilityChange={setIntroVisible}
      />
      <NotificationBanner />
    </View>
  );
}

function RootThemeShell() {
  const settingsContext = useSettings();
  const isDark = settingsContext?.resolvedColorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <NotificationProvider>
          <NavigationProtector isDark={isDark} />
        </NotificationProvider>
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
});
