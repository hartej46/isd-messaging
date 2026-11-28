import React, { useCallback, useState } from 'react';
import {
  BackHandler,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  LogOut,
  Mail,
  MessageSquare,
  Moon,
  Settings,
  ShieldCheck,
  Smartphone,
  Sun,
  User,
} from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage';
import { BorderRadius, Spacing } from '@/constants/theme';
import { BottomNavBar } from '@/components/one-ui/BottomNavBar';

const THEME_MODES = [
  { id: 'system', label: 'System', Icon: Smartphone },
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [stats, setStats] = useState({ threadCount: 0, messageCount: 0 });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const backSubscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          router.replace('/');
          return true;
        }
      );

      storageService
        .getStorageStats()
        .then((data) => {
          if (isActive) setStats(data);
        })
        .catch((err) => {
          console.error('Failed to load profile stats:', err);
        });
      return () => {
        isActive = false;
        backSubscription.remove();
      };
    }, [])
  );

  const handleBackToHome = () => {
    router.replace('/');
  };

  const handleBottomTabSelect = (tabId) => {
    if (tabId === 'messages') {
      router.replace('/');
    } else if (tabId === 'contacts') {
      router.replace({ pathname: '/', params: { tab: 'contacts' } });
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Messages?', [
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: logout,
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.backgroundElement }]}
      edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={handleBackToHome}
          hitSlop={10}
          accessibilityLabel="Back to home">
          <ChevronLeft size={25} color={theme.text} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <Pressable
          style={({ pressed }) => [
            styles.settingsBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => router.push('/settings')}
          hitSlop={10}
          accessibilityLabel="Open settings">
          <Settings size={22} color={theme.text} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.avatarSection}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: theme.accentSurface },
              ]}>
              <User size={34} color={theme.accentOnSurface} strokeWidth={2} />
            </View>
            <Text style={[styles.displayName, { color: theme.text }]}>
              {user?.name || 'User'}
            </Text>
            <View style={styles.emailRow}>
              <Mail size={14} color={theme.textSecondary} />
              <Text style={[styles.emailText, { color: theme.textSecondary }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: theme.primaryLight },
              ]}>
              <ShieldCheck size={14} color={theme.primary} />
              <Text style={[styles.statusText, { color: theme.primary }]}>
                Local Account Active
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View
                style={[styles.statIconWrap, { backgroundColor: theme.primaryLight }]}>
                <MessageSquare size={20} color={theme.primary} />
              </View>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {stats.threadCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Conversations
              </Text>
            </View>

            <View
              style={[styles.statDivider, { backgroundColor: theme.borderLight }]}
            />

            <View style={styles.statBox}>
              <View
                style={[styles.statIconWrap, { backgroundColor: theme.primaryLight }]}>
                <Database size={20} color={theme.primary} />
              </View>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {stats.messageCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Saved Messages
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Appearance</Text>
          <View style={styles.themePillsRow}>
            {THEME_MODES.map(({ id, label, Icon }) => {
              const isSelected = settings.theme === id;
              return (
                <Pressable
                  key={id}
                  style={[
                    styles.themePill,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.backgroundElement,
                    },
                  ]}
                  onPress={() => updateSettings({ theme: id })}>
                  <Icon
                    size={16}
                    color={isSelected ? '#FFFFFF' : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themePillText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.text,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.menuCard, { backgroundColor: theme.card }]}>
          <Pressable
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: theme.backgroundSelected },
            ]}
            onPress={() => router.push('/settings')}>
            <View
              style={[styles.menuIconWrap, { backgroundColor: theme.primaryLight }]}>
              <Settings size={18} color={theme.primary} />
            </View>
            <Text style={[styles.menuRowText, { color: theme.text }]}>
              App Settings
            </Text>
            <ChevronRight size={18} color={theme.textTertiary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderLight }]} />

          <Pressable
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: `${theme.danger}12` },
            ]}
            onPress={handleSignOut}>
            <View
              style={[styles.menuIconWrap, { backgroundColor: `${theme.danger}18` }]}>
              <LogOut size={18} color={theme.danger} />
            </View>
            <Text style={[styles.menuRowText, { color: theme.danger }]}>
              Sign Out
            </Text>
            <ChevronRight size={18} color={theme.danger} />
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="profile" onSelectTab={handleBottomTabSelect} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.4,
    marginLeft: Spacing.two,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.four,
    gap: 12,
  },
  card: {
    borderRadius: 26,
    padding: Spacing.four,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 6,
  },
  avatarCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emailText: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    gap: 6,
    marginTop: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 48,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.two + 2,
  },
  themePillsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: BorderRadius.pill,
  },
  themePillText: {
    fontSize: 13,
  },
  menuCard: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: 15,
    gap: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  rowDivider: {
    height: 1,
    marginLeft: 74,
  },
});
