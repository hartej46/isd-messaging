import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from '@/components/one-ui/SquircleAvatar';

const THEME_OPTIONS = [
  { id: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { id: 'light', label: 'Light', icon: 'sunny-outline' },
  { id: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [stats, setStats] = useState({ threadCount: 0, messageCount: 0 });
  const [busyAction, setBusyAction] = useState(false);

  const loadStats = useCallback(() => {
    storageService
      .getStorageStats()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error('Failed to load storage stats:', err);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      storageService
        .getStorageStats()
        .then((data) => {
          if (isActive) setStats(data);
        })
        .catch((err) => {
          console.error('Failed to load storage stats:', err);
        });
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleMarkAllRead = async () => {
    if (busyAction) return;
    setBusyAction(true);
    try {
      await storageService.markAllAsRead();
      Alert.alert('Done', 'All conversations have been marked as read.');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setBusyAction(false);
    }
  };

  const handleExportBackup = async () => {
    if (busyAction) return;
    setBusyAction(true);
    try {
      const backupJson = await storageService.exportBackupData();
      const result = await Share.share({
        title: 'Messages Local Backup',
        message: backupJson,
      });
      if (result.action === Share.dismissedAction) {
        return;
      }
    } catch {
      Alert.alert(
        'Export Backup Ready',
        `Prepared local backup (${stats.threadCount} conversations, ${stats.messageCount} messages). Share sheet is unavailable on this platform.`
      );
    } finally {
      setBusyAction(false);
    }
  };

  const handleResetDemo = () => {
    Alert.alert(
      'Sync DummyJSON API',
      'Fetch fresh contacts and conversations from DummyJSON API? Current local chats will be replaced.',
      [
        {
          text: 'Sync',
          style: 'destructive',
          onPress: async () => {
            setBusyAction(true);
            try {
              await storageService.syncWithRemoteApi();
              loadStats();
              Alert.alert(
                'Sync Complete',
                'Fresh users and conversations have been loaded from DummyJSON API.'
              );
            } catch {
              await storageService.resetAllData();
              loadStats();
              Alert.alert(
                'Offline Fallback',
                'Could not reach DummyJSON API. Restored local sample conversations.'
              );
            } finally {
              setBusyAction(false);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClearAllMessages = () => {
    Alert.alert(
      'Clear All Messages',
      'Delete every conversation and message stored on this device? Your signed-in account will stay active.',
      [
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setBusyAction(true);
            try {
              await storageService.clearAllThreadsAndMessages();
              loadStats();
              Alert.alert('Cleared', 'All local conversations have been deleted.');
            } catch (err) {
              console.error('Failed to clear messages:', err);
            } finally {
              setBusyAction(false);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.appBar}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { backgroundColor: theme.backgroundElement },
          ]}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.cardSubtle, borderColor: theme.border },
          ]}>
          <SquircleAvatar
            initials={user?.avatarInitials || 'GU'}
            size={56}
            backgroundColor={theme.primary}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {user?.name || 'Galaxy User'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
              {user?.email || 'user@example.com'}
            </Text>
            <View
              style={[
                styles.sessionPill,
                { backgroundColor: `${theme.success}18` },
              ]}>
              <View style={[styles.sessionDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.sessionText, { color: theme.success }]}>
                Local session active
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>
          APPEARANCE
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <Text style={[styles.cardGroupTitle, { color: theme.text }]}>
            App Theme
          </Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((option) => {
              const isSelected = settings.theme === option.id;
              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.backgroundElement,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => updateSettings({ theme: option.id })}>
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={isSelected ? '#FFFFFF' : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.text,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>
          MESSAGING
        </Text>
        <View
          style={[
            styles.listCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={theme.primary}
              />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Simulated Auto-Reply
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Receive mock responses after sending a message
              </Text>
            </View>
            <Switch
              value={settings.autoReply}
              onValueChange={(val) => updateSettings({ autoReply: val })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderLight }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={theme.primary}
              />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Message Notifications
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Show unread badges and notification alerts
              </Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(val) => updateSettings({ notifications: val })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>
          LOCAL STORAGE
        </Text>
        <View
          style={[
            styles.listCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="server-outline" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                AsyncStorage Usage
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                {stats.threadCount} conversations and {stats.messageCount} messages saved locally
              </Text>
            </View>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderLight }]} />

          <Pressable
            style={({ pressed }) => [
              styles.actionRow,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}
            disabled={busyAction}
            onPress={handleMarkAllRead}>
            <View style={styles.settingIconBox}>
              <Ionicons name="checkmark-done-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.actionRowText, { color: theme.text }]}>
              Mark all conversations as read
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderLight }]} />

          <Pressable
            style={({ pressed }) => [
              styles.actionRow,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}
            disabled={busyAction}
            onPress={handleResetDemo}>
            <View style={styles.settingIconBox}>
              <Ionicons name="refresh-outline" size={20} color={theme.text} />
            </View>
            <Text style={[styles.actionRowText, { color: theme.text }]}>
              Sync DummyJSON API data
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderLight }]} />

          <Pressable
            style={({ pressed }) => [
              styles.actionRow,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}
            disabled={busyAction}
            onPress={handleExportBackup}>
            <View style={styles.settingIconBox}>
              <Ionicons name="download-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.actionRowText, { color: theme.text }]}>
              Export local backup
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderLight }]} />

          <Pressable
            style={({ pressed }) => [
              styles.actionRow,
              pressed && { backgroundColor: `${theme.danger}12` },
            ]}
            disabled={busyAction}
            onPress={handleClearAllMessages}>
            <View style={styles.settingIconBox}>
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </View>
            <Text style={[styles.actionRowText, { color: theme.danger }]}>
              Clear all local messages
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.danger} />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: pressed ? `${theme.danger}18` : theme.card,
              borderColor: theme.danger,
            },
          ]}
          onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          <Text style={[styles.signOutText, { color: theme.danger }]}>
            Sign Out
          </Text>
        </Pressable>

        <Text style={[styles.versionFooter, { color: theme.textTertiary }]}>
          Messages Mobile App - Local Offline Mode
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three + 2,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 13,
  },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    gap: 5,
    marginTop: 4,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sessionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  cardGroup: {
    padding: Spacing.three,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    gap: Spacing.two + 2,
    marginBottom: Spacing.four,
  },
  cardGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 13,
  },
  listCard: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.four,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  settingIconBox: {
    width: 32,
    alignItems: 'center',
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  rowDivider: {
    height: 1,
    marginLeft: 56,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  actionRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 52,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    marginTop: Spacing.one,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: Spacing.four,
  },
});
