import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SearchBar } from '@/components/one-ui/SearchBar';
import { CategoryTabs } from '@/components/one-ui/CategoryTabs';
import { ConversationItem } from '@/components/one-ui/ConversationItem';
import { ComposeFAB } from '@/components/one-ui/ComposeFAB';
import { ThreadActionModal } from '@/components/one-ui/ThreadActionModal';
import { OverflowMenuModal } from '@/components/one-ui/OverflowMenuModal';

export default function HomeScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Modals state
  const [selectedThread, setSelectedThread] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [overflowMenuVisible, setOverflowMenuVisible] = useState(false);

  const refreshThreadList = useCallback(async () => {
    try {
      const data = await storageService.getThreads();
      const sorted = [...data].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
      setThreads(sorted);
    } catch (err) {
      console.error('Failed to load threads:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      storageService
        .getThreads()
        .then((data) => {
          if (!isActive) return;
          const sorted = [...data].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
          });
          setThreads(sorted);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load threads:', err);
          if (isActive) setLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshThreadList();
    setRefreshing(false);
  };

  // Actions
  const handleTogglePin = async (threadId) => {
    try {
      const updated = await storageService.togglePin(threadId);
      const sorted = [...updated].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
      setThreads(sorted);
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleToggleRead = async (threadId) => {
    try {
      const updated = await storageService.toggleRead(threadId);
      setThreads(updated);
    } catch (err) {
      console.error('Failed to toggle read:', err);
    }
  };

  const handleDeleteThread = async (threadId) => {
    try {
      const updated = await storageService.deleteThread(threadId);
      setThreads(updated);
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const updated = await storageService.markAllAsRead();
      setThreads(updated);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleResetData = async () => {
    setLoading(true);
    try {
      await storageService.resetAllData();
      await refreshThreadList();
    } catch (err) {
      console.error('Failed to reset data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConversation = async (thread) => {
    // Clear unread count and navigate to the conversation thread
    if (thread.unreadCount > 0) {
      try {
        const updated = await storageService.markThreadAsRead(thread.id);
        setThreads(updated);
      } catch (err) {
        console.error('Failed to mark thread read:', err);
      }
    }
    router.push(`/chat/${thread.id}`);
  };

  const handleLongPressConversation = (thread) => {
    setSelectedThread(thread);
    setActionModalVisible(true);
  };

  // Computed metrics
  const totalUnread = useMemo(
    () => threads.reduce((acc, t) => acc + (t.unreadCount > 0 ? 1 : 0), 0),
    [threads]
  );

  const pinnedCount = useMemo(
    () => threads.reduce((acc, t) => acc + (t.isPinned ? 1 : 0), 0),
    [threads]
  );

  const categoryTabs = useMemo(
    () => [
      { id: 'all', label: 'All', badge: threads.length },
      { id: 'unread', label: 'Unread', badge: totalUnread },
      { id: 'starred', label: 'Starred', badge: pinnedCount },
    ],
    [threads.length, totalUnread, pinnedCount]
  );

  // Filtering
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = t.contactName.toLowerCase().includes(query);
        const matchesMsg = t.lastMessage.toLowerCase().includes(query);
        const matchesPhone = t.phoneNumber.includes(query);
        if (!matchesName && !matchesMsg && !matchesPhone) return false;
      }

      // Tab filter
      if (activeTab === 'unread') return t.unreadCount > 0;
      if (activeTab === 'starred') return t.isPinned;

      return true;
    });
  }, [threads, searchQuery, activeTab]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Signature One UI Viewing Area Header */}
      <View style={styles.headerViewingArea}>
        <View style={styles.headerTopBar}>
          <View style={styles.headerTitleGroup}>
            <Text style={[styles.appTitle, { color: theme.text }]}>Messages</Text>
            {totalUnread > 0 && (
              <View
                style={[
                  styles.unreadHeaderBadge,
                  { backgroundColor: theme.primaryLight },
                ]}>
                <Text style={[styles.unreadHeaderText, { color: theme.primary }]}>
                  {totalUnread} new
                </Text>
              </View>
            )}
          </View>

          {/* Right Action Icons */}
          <View style={styles.headerIconsRow}>
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: theme.cardSubtle, borderColor: theme.border },
              ]}
              onPress={() => setOverflowMenuVisible(true)}
              hitSlop={8}
              accessibilityLabel="More options">
              <Ionicons name="ellipsis-vertical" size={18} color={theme.text} />
            </Pressable>
          </View>
        </View>

        <Text style={[styles.headerGreeting, { color: theme.textSecondary }]}>
          {user?.name ? `Welcome back, ${user.name}` : 'Keep in touch with friends and family'}
        </Text>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search conversations, contacts, numbers..."
          />
        </View>

        {/* Category Tabs */}
        <CategoryTabs
          tabs={categoryTabs}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      </View>

      {/* Main Conversation FlatList */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading conversations...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredThreads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
          renderItem={({ item }) => (
            <ConversationItem
              thread={item}
              onPress={handleOpenConversation}
              onLongPress={handleLongPressConversation}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: theme.backgroundElement },
                ]}>
                <Ionicons
                  name={searchQuery ? 'search-outline' : 'chatbubbles-outline'}
                  size={42}
                  color={theme.textTertiary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery ? 'No messages found' : 'No conversations yet'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {searchQuery
                  ? `No results matching "${searchQuery}". Check your spelling or try another name.`
                  : 'Tap the pencil button below to start your first conversation.'}
              </Text>
              {searchQuery ? (
                <Pressable
                  style={[
                    styles.resetSearchBtn,
                    { backgroundColor: theme.primaryLight },
                  ]}
                  onPress={() => setSearchQuery('')}>
                  <Text style={[styles.resetSearchText, { color: theme.primary }]}>
                    Clear search filter
                  </Text>
                </Pressable>
              ) : null}
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <ComposeFAB onPress={() => router.push('/compose')} />

      {/* Long-press Thread Context Modal */}
      <ThreadActionModal
        visible={actionModalVisible}
        thread={selectedThread}
        onClose={() => {
          setActionModalVisible(false);
          setSelectedThread(null);
        }}
        onTogglePin={handleTogglePin}
        onToggleRead={handleToggleRead}
        onDelete={handleDeleteThread}
      />

      {/* Overflow Options Modal */}
      <OverflowMenuModal
        visible={overflowMenuVisible}
        onClose={() => setOverflowMenuVisible(false)}
        onMarkAllRead={handleMarkAllRead}
        onResetData={handleResetData}
        onSignOut={logout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerViewingArea: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  unreadHeaderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  unreadHeaderText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerGreeting: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: -4,
  },
  searchWrapper: {
    marginVertical: Spacing.one,
  },
  listContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: 90, // Room for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  resetSearchBtn: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.pill,
  },
  resetSearchText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
