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
import { MessageSquare, Search } from 'lucide-react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage';
import { sortThreads } from '@/utils/formatters';
import { BorderRadius, Spacing } from '@/constants/theme';
import { HomeHeader } from '@/components/one-ui/HomeHeader';
import { HomeFilterStrip } from '@/components/one-ui/HomeFilterStrip';
import { ContactsCallList } from '@/components/one-ui/ContactsCallList';
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
  const settingsContext = useSettings();
  const notifications = useNotifications();
  const subscribeIncoming = notifications?.subscribeIncoming;
  const showUnreadBadge = settingsContext?.settings?.notifications ?? true;
  const params = useLocalSearchParams();
  const initialTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;

  const [bottomTab, setBottomTab] = useState(
    initialTab === 'contacts' ? 'contacts' : 'messages'
  );
  const [threads, setThreads] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageMatches, setMessageMatches] = useState([]);
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const [selectedThread, setSelectedThread] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [overflowMenuVisible, setOverflowMenuVisible] = useState(false);
  const [syncingContacts, setSyncingContacts] = useState(false);
  const [contactsMeta, setContactsMeta] = useState({ count: 0, syncedAt: null });

  const [scrollY] = useState(() => new Animated.Value(0));

  const refreshData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const [threadData, contactData, meta] = await Promise.all([
        storageService.getThreads(),
        storageService.getAllContacts(),
        storageService.getDeviceContactsMeta(),
      ]);
      setThreads(sortThreads(threadData));
      setContactsList([...contactData.recent, ...contactData.directory]);
      setContactsMeta(meta);
    } catch {
      setErrorMsg('Unable to load conversations. Pull down or tap retry.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      Promise.all([
        storageService.getThreads(),
        storageService.getAllContacts(),
        storageService.getDeviceContactsMeta(),
      ])
        .then(([threadData, contactData, meta]) => {
          if (!isActive) return;
          setErrorMsg(null);
          setThreads(sortThreads(threadData));
          setContactsList([...contactData.recent, ...contactData.directory]);
          setContactsMeta(meta);
          setLoading(false);
        })
        .catch(() => {
          if (isActive) {
            setErrorMsg('Unable to load conversations from storage.');
            setLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, [])
  );

  useEffect(() => {
    if (!subscribeIncoming) return undefined;
    return subscribeIncoming(() => {
      refreshData();
    });
  }, [subscribeIncoming, refreshData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleSyncDeviceContacts = async () => {
    setSyncingContacts(true);
    try {
      const result = await storageService.syncDeviceContacts();
      if (!result.supported) {
        Alert.alert(
          'Not Supported on Web',
          'Device contact sync requires iOS or Android.'
        );
        return;
      }
      if (result.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow Contacts permission in your device settings to sync contacts.'
        );
        return;
      }
      await refreshData();
      Alert.alert(
        'Contacts Synced',
        `Synced ${result.count} contacts from your device.`
      );
    } catch {
      setErrorMsg('Failed to sync device contacts.');
    } finally {
      setSyncingContacts(false);
    }
  };

  const handleOpenContactChat = async (contact) => {
    if (contact.threadId) {
      router.push(`/chat/${contact.threadId}`);
      return;
    }
    try {
      const thread = await storageService.getOrCreateThreadForContact(contact);
      router.push(`/chat/${thread.id}`);
    } catch {
      setErrorMsg('Failed to start conversation with contact.');
    }
  };

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return undefined;

    let isActive = true;
    storageService
      .searchAllMessages(trimmed)
      .then((matches) => {
        if (isActive) setMessageMatches(matches);
      })
      .catch(() => {
        if (isActive) setErrorMsg('Search failed. Please try again.');
      });

    return () => {
      isActive = false;
    };
  }, [searchQuery]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (!value.trim()) setMessageMatches([]);
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
    } catch {
      setErrorMsg('Could not update pin status.');
    }
  };

  const handleToggleRead = async (threadId) => {
    try {
      const updated = await storageService.toggleRead(threadId);
      setThreads(sortThreads(updated));
    } catch {
      setErrorMsg('Could not update read status.');
    }
  };

  const handleDeleteThread = async (threadId) => {
    try {
      const updated = await storageService.deleteThread(threadId);
      setThreads(sortThreads(updated));
    } catch {
      setErrorMsg('Could not delete conversation.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const updated = await storageService.markAllAsRead();
      setThreads(sortThreads(updated));
    } catch {
      setErrorMsg('Could not mark conversations as read.');
    }
  };

  const handleResetData = async () => {
    setLoading(true);
    try {
      await storageService.resetAllData();
      await refreshData();
    } catch {
      setErrorMsg('Failed to sync demo conversations.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConversation = async (thread) => {
    if (thread.unreadCount > 0) {
      try {
        const updated = await storageService.markThreadAsRead(thread.id);
        setThreads(sortThreads(updated));
      } catch {
        setErrorMsg('Failed to mark conversation as read.');
      }
    }
    router.push(`/chat/${thread.id}`);
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

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.backgroundElement }]}
      edges={['top', 'bottom']}>
      <HomeHeader
        title={bottomTab === 'contacts' ? 'Contacts' : 'Messages'}
        scrollY={scrollY}
        searchOpen={searchOpen}
        onToggleSearch={handleToggleSearch}
        onOpenMenu={() => setOverflowMenuVisible(true)}
      />

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

      {errorMsg ? (
        <Pressable
          style={[
            styles.errorBanner,
            { backgroundColor: `${theme.danger}15`, borderColor: `${theme.danger}40` },
          ]}
          onPress={handleRefresh}>
          <Text style={[styles.errorText, { color: theme.danger }]}>{errorMsg}</Text>
          <Text style={[styles.retryText, { color: theme.danger }]}>Retry</Text>
        </Pressable>
      ) : null}

      {bottomTab === 'messages' ? (
        <HomeFilterStrip
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          showExtraFilters={showExtraFilters}
          onToggleExtraFilters={() => {
            if (showExtraFilters) {
              setShowExtraFilters(false);
              setActiveFilter('all');
            } else {
              setShowExtraFilters(true);
            }
          }}
        />
      ) : null}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading...
          </Text>
        </View>
      ) : bottomTab === 'contacts' ? (
        <ContactsCallList
          contacts={filteredContacts}
          scrollY={scrollY}
          onSyncContacts={handleSyncDeviceContacts}
          syncingContacts={syncingContacts}
          syncStatusText={
            contactsMeta.count > 0
              ? `${contactsMeta.count} synced from your phone`
              : 'Sync phone contacts to message or call'
          }
          onOpenContactChat={handleOpenContactChat}
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
              showUnreadBadge={showUnreadBadge}
              onPress={handleOpenConversation}
              onLongPress={(thread) => {
                setSelectedThread(thread);
                setActionModalVisible(true);
              }}
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
              <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
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
  searchBarContainer: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: Spacing.two,
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
