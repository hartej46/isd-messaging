import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from '@/components/one-ui/SquircleAvatar';

export default function HomeScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);

  useEffect(() => {
    let isMounted = true;
    storageService
      .getThreads()
      .then((data) => {
        if (isMounted) {
          setThreads(data);
          setLoadingThreads(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load threads:', err);
        if (isMounted) {
          setLoadingThreads(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleResetData = async () => {
    setLoadingThreads(true);
    try {
      await storageService.resetAllData();
      const data = await storageService.getThreads();
      setThreads(data);
    } catch (err) {
      console.error('Failed to reset data:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* One UI Large Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <Text style={[styles.appTitle, { color: theme.text }]}>Messages</Text>
          <View style={styles.headerRightActions}>
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: theme.cardSubtle, borderColor: theme.border },
              ]}
              onPress={handleResetData}
              accessibilityLabel="Reset local data">
              <Ionicons name="refresh-outline" size={18} color={theme.textSecondary} />
            </Pressable>
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: theme.cardSubtle, borderColor: theme.border },
              ]}
              onPress={logout}
              accessibilityLabel="Sign out">
              <Ionicons name="log-out-outline" size={18} color={theme.danger} />
            </Pressable>
          </View>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          One UI • Local Storage Active
        </Text>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.topCardsSection}>
            {/* User Profile Card */}
            <View
              style={[
                styles.userCard,
                { backgroundColor: theme.cardSubtle, borderColor: theme.border },
              ]}>
              <SquircleAvatar
                initials={user?.avatarInitials || 'GU'}
                size={54}
                backgroundColor={theme.primary}
              />
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={[styles.userName, { color: theme.text }]}>
                    {user?.name || 'Galaxy User'}
                  </Text>
                  <View
                    style={[
                      styles.onlineBadge,
                      { backgroundColor: `${theme.success}20` },
                    ]}>
                    <View
                      style={[styles.onlineDot, { backgroundColor: theme.success }]}
                    />
                    <Text style={[styles.onlineText, { color: theme.success }]}>
                      Logged In
                    </Text>
                  </View>
                </View>
                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                  {user?.email || 'user@galaxy.com'}
                </Text>
              </View>
            </View>

            {/* Day 1 Milestone Card */}
            <View
              style={[
                styles.milestoneCard,
                { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}>
              <View style={styles.milestoneHeader}>
                <Ionicons name="checkmark-done-circle" size={22} color={theme.primary} />
                <Text style={[styles.milestoneTitle, { color: theme.primaryDark }]}>
                  Day 1 Implementation Complete
                </Text>
              </View>
              <Text style={[styles.milestoneDesc, { color: theme.primaryDark }]}>
                ✓ AsyncStorage session persistence active{'\n'}
                ✓ Mock login system enabled for any credentials{'\n'}
                ✓ Modern One UI theme system and squircle tokens applied{'\n'}
                ✓ {threads.length} seeded conversations loaded from local storage
              </Text>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                LOCAL CONVERSATION THREADS ({threads.length})
              </Text>
              {loadingThreads && <ActivityIndicator size="small" color={theme.primary} />}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.threadCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <SquircleAvatar
              initials={item.contactName}
              size={44}
              backgroundColor={item.avatarColor}
            />
            <View style={styles.threadContent}>
              <View style={styles.threadTopRow}>
                <View style={styles.nameRow}>
                  <Text style={[styles.contactName, { color: theme.text }]}>
                    {item.contactName}
                  </Text>
                  {item.isPinned && (
                    <Ionicons
                      name="pin"
                      size={14}
                      color={theme.pinned}
                      style={styles.pinIcon}
                    />
                  )}
                </View>
                <Text style={[styles.threadTimestamp, { color: theme.textTertiary }]}>
                  {item.timestamp}
                </Text>
              </View>
              <View style={styles.threadBottomRow}>
                <Text
                  style={[styles.lastMessage, { color: theme.textSecondary }]}
                  numberOfLines={1}>
                  {item.lastMessage}
                </Text>
                {item.unreadCount > 0 && (
                  <View
                    style={[
                      styles.unreadPill,
                      { backgroundColor: theme.unreadBadge },
                    ]}>
                    <Text style={styles.unreadPillText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footerSection}>
            <Pressable
              style={({ pressed }) => [
                styles.logoutBtn,
                {
                  borderColor: theme.danger,
                  backgroundColor: pressed ? `${theme.danger}15` : 'transparent',
                },
              ]}
              onPress={logout}>
              <Ionicons name="log-out-outline" size={18} color={theme.danger} />
              <Text style={[styles.logoutBtnText, { color: theme.danger }]}>
                Sign Out of Messages
              </Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  topCardsSection: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    gap: Spacing.three,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '700',
  },
  milestoneCard: {
    padding: Spacing.three,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    gap: Spacing.two,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  milestoneDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  threadContent: {
    flex: 1,
  },
  threadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  pinIcon: {
    marginLeft: 2,
  },
  threadTimestamp: {
    fontSize: 12,
  },
  threadBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: Spacing.two,
  },
  unreadPill: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  footerSection: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
