import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  EllipsisVertical,
  MessageSquare,
  Phone,
  Plus,
  Search,
  User,
} from 'lucide-react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage';
import { Spacing } from '@/constants/theme';
import { SearchBar } from '@/components/one-ui/SearchBar';
import { ConversationItem } from '@/components/one-ui/ConversationItem';
import { ComposeFAB } from '@/components/one-ui/ComposeFAB';
import { ThreadActionModal } from '@/components/one-ui/ThreadActionModal';
import { OverflowMenuModal } from '@/components/one-ui/OverflowMenuModal';
import { MessageSearchResults } from '@/components/one-ui/MessageSearchResults';
import { BottomNavBar } from '@/components/one-ui/BottomNavBar';

export default function HomeScreen() {
  const theme = useTheme();
  const { logout } = useAuth();
  const params = useLocalSearchParams();
  const initialTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;

  const [bottomTab, setBottomTab] = useState(
    initialTab === 'contacts' ? 'contacts' : 'messages'
  );
  const [threads, setThreads] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageMatches, setMessageMatches] = useState([]);
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const [selectedThread, setSelectedThread] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [overflowMenuVisible, setOverflowMenuVisible] = useState(false);

  const [scrollY] = useState(() => new Animated.Value(0));

  const sortThreads = (list) =>
    [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const refreshData = useCallback(async () => {
    try {
      const [threadData, contactData] = await Promise.all([
        storageService.getThreads(),
        storageService.getAllContacts(),
      ]);
      setThreads(sortThreads(threadData));
      setContactsList([...contactData.recent, ...contactData.directory]);
    } catch (err) {
      console.error('Failed to load home data:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      Promise.all([storageService.getThreads(), storageService.getAllContacts()])
        .then(([threadData, contactData]) => {
          if (!isActive) return;
          setThreads(sortThreads(threadData));
          setContactsList([...contactData.recent, ...contactData.directory]);
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
    await refreshData();
    setRefreshing(false);
  };

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return undefined;

    let isActive = true;
    storageService
      .searchAllMessages(trimmed)
      .then((matches) => {
        if (isActive) {
          setMessageMatches(matches);
        }
      })
      .catch((err) => {
        console.error('Failed to search messages:', err);
      });

    return () => {
      isActive = false;
    };
  }, [searchQuery]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setMessageMatches([]);
    }
  };

  const handleToggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearchQuery('');
      setMessageMatches([]);
    } else {
      setSearchOpen(true);
    }
  };

  const handleTogglePin = async (threadId) => {
    try {
      const updated = await storageService.togglePin(threadId);
      setThreads(sortThreads(updated));
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleToggleRead = async (threadId) => {
    try {
      const updated = await storageService.toggleRead(threadId);
      setThreads(sortThreads(updated));
    } catch (err) {
      console.error('Failed to toggle read:', err);
    }
  };

  const handleDeleteThread = async (threadId) => {
    try {
      const updated = await storageService.deleteThread(threadId);
      setThreads(sortThreads(updated));
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const updated = await storageService.markAllAsRead();
      setThreads(sortThreads(updated));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleResetData = async () => {
    setLoading(true);
    try {
      await storageService.resetAllData();
      await refreshData();
    } catch (err) {
      console.error('Failed to reset data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConversation = async (thread) => {
    if (thread.unreadCount > 0) {
      try {
        const updated = await storageService.markThreadAsRead(thread.id);
        setThreads(sortThreads(updated));
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

  const handleBottomTabSelect = (tabId) => {
    if (tabId === 'profile') {
      router.replace('/profile');
      return;
    }
    scrollY.setValue(0);
    setBottomTab(tabId);
  };

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = t.contactName.toLowerCase().includes(query);
        const matchesMsg = t.lastMessage.toLowerCase().includes(query);
        const matchesPhone = t.phoneNumber.includes(query);
        if (!matchesName && !matchesMsg && !matchesPhone) return false;
      }

      if (activeFilter === 'unread') return t.unreadCount > 0;
      if (activeFilter === 'starred') return t.isPinned;

      return true;
    });
  }, [threads, searchQuery, activeFilter]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contactsList;
    const query = searchQuery.toLowerCase().trim();
    return contactsList.filter(
      (c) =>
        c.contactName.toLowerCase().includes(query) ||
        c.phoneNumber.toLowerCase().includes(query)
    );
  }, [contactsList, searchQuery]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 110],
    outputRange: [158, 52],
    extrapolate: 'clamp',
  });

  const bigTitleOpacity = scrollY.interpolate({
    inputRange: [0, 65],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [60, 105],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const currentHeaderTitle = bottomTab === 'contacts' ? 'Contacts' : 'Messages';

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.backgroundElement }]}
      edges={['top', 'bottom']}>
      <Animated.View
        style={[
          styles.collapsibleHeader,
          {
            height: headerHeight,
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        <Animated.View
          style={[
            styles.expandedTitleWrap,
            { opacity: bigTitleOpacity },
          ]}
          pointerEvents="none">
          <Text style={[styles.expandedTitle, { color: theme.text }]}>
            {currentHeaderTitle}
          </Text>
        </Animated.View>

        <View style={styles.topActionBar}>
          <Animated.Text
            style={[
              styles.compactTitle,
              { color: theme.text, opacity: compactTitleOpacity },
            ]}>
            {currentHeaderTitle}
          </Animated.Text>

          <View style={styles.topIconsGroup}>
            <Pressable
              onPress={handleToggleSearch}
              hitSlop={10}
              style={({ pressed }) => [
                styles.headerIconBtn,
                pressed && { opacity: 0.6 },
              ]}
              accessibilityLabel="Search">
              <Search
                size={22}
                color={searchOpen ? theme.primary : theme.text}
                strokeWidth={2}
              />
            </Pressable>
            <Pressable
              onPress={() => setOverflowMenuVisible(true)}
              hitSlop={10}
              style={({ pressed }) => [
                styles.headerIconBtn,
                pressed && { opacity: 0.6 },
              ]}
              accessibilityLabel="More options">
              <EllipsisVertical size={22} color={theme.text} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {searchOpen ? (
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchChange}
            onClear={() => handleSearchChange('')}
            placeholder={
              bottomTab === 'contacts'
                ? 'Search contacts or numbers...'
                : 'Search conversations, messages...'
            }
            autoFocus
          />
        </View>
      ) : null}

      {bottomTab === 'messages' ? (
        <View style={styles.filterStrip}>
          <Pressable
            style={[
              styles.filterTab,
              activeFilter === 'all' && {
                borderBottomWidth: 2,
                borderBottomColor: theme.primary,
              },
            ]}
            onPress={() => setActiveFilter('all')}>
            <Text
              style={[
                styles.filterTabText,
                {
                  color:
                    activeFilter === 'all' ? theme.primary : theme.textSecondary,
                  fontWeight: activeFilter === 'all' ? '700' : '500',
                },
              ]}>
              All
            </Text>
          </Pressable>

          {showExtraFilters ? (
            <>
              <Pressable
                style={[
                  styles.filterTab,
                  activeFilter === 'unread' && {
                    borderBottomWidth: 2,
                    borderBottomColor: theme.primary,
                  },
                ]}
                onPress={() => setActiveFilter('unread')}>
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color:
                        activeFilter === 'unread'
                          ? theme.primary
                          : theme.textSecondary,
                      fontWeight: activeFilter === 'unread' ? '700' : '500',
                    },
                  ]}>
                  Unread
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterTab,
                  activeFilter === 'starred' && {
                    borderBottomWidth: 2,
                    borderBottomColor: theme.primary,
                  },
                ]}
                onPress={() => setActiveFilter('starred')}>
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color:
                        activeFilter === 'starred'
                          ? theme.primary
                          : theme.textSecondary,
                      fontWeight: activeFilter === 'starred' ? '700' : '500',
                    },
                  ]}>
                  Starred
                </Text>
              </Pressable>
            </>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.plusFilterBtn,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => {
              if (showExtraFilters) {
                setShowExtraFilters(false);
                setActiveFilter('all');
              } else {
                setShowExtraFilters(true);
              }
            }}
            hitSlop={8}
            accessibilityLabel="Toggle category filters">
            <Plus
              size={20}
              color={showExtraFilters ? theme.primary : theme.textSecondary}
              strokeWidth={1.8}
            />
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading...
          </Text>
        </View>
      ) : bottomTab === 'contacts' ? (
        <Animated.FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          style={styles.flex}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => {
            const isFirst = index === 0;
            const isLast = index === filteredContacts.length - 1;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.contactCallRow,
                  {
                    backgroundColor: pressed ? theme.backgroundSelected : theme.card,
                    borderTopLeftRadius: isFirst ? 26 : 0,
                    borderTopRightRadius: isFirst ? 26 : 0,
                    borderBottomLeftRadius: isLast ? 26 : 0,
                    borderBottomRightRadius: isLast ? 26 : 0,
                  },
                ]}
                onPress={() =>
                  Alert.alert(
                    'Voice Call',
                    `Calling ${item.contactName} (${item.phoneNumber})...`
                  )
                }>
                <View
                  style={[styles.contactAvatar, { backgroundColor: theme.primary }]}>
                  <User size={21} color="#FFFFFF" strokeWidth={2.1} />
                </View>
                <View style={styles.contactMeta}>
                  <Text style={[styles.contactName, { color: theme.text }]}>
                    {item.contactName}
                  </Text>
                  <Text style={[styles.contactNumber, { color: theme.textSecondary }]}>
                    {item.phoneNumber}
                  </Text>
                </View>
                <View
                  style={[
                    styles.callCircleBtn,
                    { backgroundColor: theme.primaryLight },
                  ]}>
                  <Phone size={18} color={theme.primary} strokeWidth={2.2} />
                </View>
              </Pressable>
            );
          }}
        />
      ) : (
        <Animated.FlatList
          data={filteredThreads}
          keyExtractor={(item) => item.id}
          style={styles.flex}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
          renderItem={({ item, index }) => (
            <ConversationItem
              thread={item}
              isFirst={index === 0}
              isLast={index === filteredThreads.length - 1}
              onPress={handleOpenConversation}
              onLongPress={handleLongPressConversation}
            />
          )}
          ListFooterComponent={
            searchQuery.trim() ? (
              <MessageSearchResults
                matches={messageMatches}
                query={searchQuery}
                onSelectMatch={(match) => router.push(`/chat/${match.thread.id}`)}
              />
            ) : null
          }
          ListEmptyComponent={
            searchQuery.trim() && messageMatches.length > 0 ? null : (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: theme.card },
                ]}>
                <View
                  style={[
                    styles.emptyIconCircle,
                    { backgroundColor: theme.primaryLight },
                  ]}>
                  {searchQuery ? (
                    <Search size={34} color={theme.primary} />
                  ) : (
                    <MessageSquare size={34} color={theme.primary} />
                  )}
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  {searchQuery ? 'No messages found' : 'No conversations yet'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  {searchQuery
                    ? `No results matching "${searchQuery}".`
                    : 'Tap the compose button to start a new message.'}
                </Text>
              </View>
            )
          }
        />
      )}

      {bottomTab === 'messages' ? (
        <ComposeFAB onPress={() => router.push('/compose')} />
      ) : null}

      <BottomNavBar activeTab={bottomTab} onSelectTab={handleBottomTabSelect} />

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

      <OverflowMenuModal
        visible={overflowMenuVisible}
        onClose={() => setOverflowMenuVisible(false)}
        onOpenSettings={() => router.push('/settings')}
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
  flex: {
    flex: 1,
  },
  collapsibleHeader: {
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.three + 2,
    overflow: 'hidden',
  },
  expandedTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 34,
    alignItems: 'center',
  },
  expandedTitle: {
    fontSize: 34,
    fontWeight: '400',
    letterSpacing: -0.6,
  },
  topActionBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: 21,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  topIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  filterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two + 2,
    gap: 18,
  },
  filterTab: {
    paddingBottom: 3,
  },
  filterTabText: {
    fontSize: 15,
  },
  plusFilterBtn: {
    padding: 2,
    marginBottom: 2,
  },
  listContainer: {
    paddingBottom: 86,
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
  contactCallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: 13,
    gap: 14,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactMeta: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactNumber: {
    fontSize: 13,
    marginTop: 2,
  },
  callCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
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
});
