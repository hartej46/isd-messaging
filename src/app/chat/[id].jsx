import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/context/SettingsContext';
import { storageService } from '@/services/storage';
import { chatApi } from '@/services/chatApi';
import { formatShortTime } from '@/utils/formatters';
import { pickContextualReply } from '@/utils/replyGenerator';
import { BorderRadius, Spacing } from '@/constants/theme';
import { ChatHeader } from '@/components/one-ui/ChatHeader';
import { MessageBubble } from '@/components/one-ui/MessageBubble';
import { ChatInputBar } from '@/components/one-ui/ChatInputBar';
import { ChatOptionsModal } from '@/components/one-ui/ChatOptionsModal';

export default function ChatThreadScreen() {
  const theme = useTheme();
  const settingsContext = useSettings();
  const isDark = settingsContext?.resolvedColorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const threadId = Array.isArray(id) ? id[0] : id;

  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(Boolean(threadId));
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const flatListRef = useRef(null);
  const timersRef = useRef([]);
  const isMountedRef = useRef(true);
  const swipeBackResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, { dx, dy }) =>
          dx < -30 && Math.abs(dx) > Math.abs(dy) * 1.5,
        onPanResponderRelease: (_, { dx, vx }) => {
          if (dx <= -100 || (dx <= -60 && vx <= -0.5)) {
            router.back();
          }
        },
      }),
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    const activeTimers = timersRef.current;

    if (!threadId) {
      return () => {
        isMountedRef.current = false;
      };
    }

    Promise.all([
      storageService.getThreadById(threadId),
      storageService.getMessages(threadId),
      storageService.markThreadAsRead(threadId),
    ])
      .then(([loadedThread, loadedMessages]) => {
        if (!isMountedRef.current) return;
        setErrorMsg(null);
        setThread(loadedThread);
        setMessages(loadedMessages);
        setLoading(false);
      })
      .catch(() => {
        if (isMountedRef.current) {
          setErrorMsg('Failed to load conversation messages.');
          setLoading(false);
        }
      });

    return () => {
      isMountedRef.current = false;
      activeTimers.forEach((t) => clearTimeout(t));
    };
  }, [threadId]);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSend = async (rawText) => {
    const cleanText = (rawText ?? inputText).trim();
    if (!cleanText || !threadId || isSending) return;

    setIsSending(true);
    setErrorMsg(null);
    if (rawText === undefined || rawText === inputText) {
      setInputText('');
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      threadId,
      text: cleanText,
      sender: 'me',
      timestamp: formatShortTime(),
      status: 'sent',
    };

    try {
      const updated = await storageService.saveMessage(threadId, newMessage);
      if (!isMountedRef.current) return;
      setMessages(updated);

      chatApi.postSimulatedMessage(cleanText);

      const scrollTimer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 60);
      timersRef.current.push(scrollTimer);

      const deliveryTimer = setTimeout(async () => {
        if (!isMountedRef.current) return;
        const deliveredList = await storageService.updateMessageStatus(
          threadId,
          newMessage.id,
          'delivered'
        );
        if (isMountedRef.current) setMessages(deliveredList);
      }, 450);
      timersRef.current.push(deliveryTimer);

      const settings = await storageService.getSettings();
      if (settings.autoReply && isMountedRef.current) {
        const typingTimer = setTimeout(() => {
          if (isMountedRef.current) {
            setIsTyping(true);
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }, 700);
        timersRef.current.push(typingTimer);

        const replyTimer = setTimeout(async () => {
          if (!isMountedRef.current) return;
          await storageService.updateMessageStatus(threadId, newMessage.id, 'read');

          const remoteReply = await chatApi.fetchRandomReply();
          const replyText =
            remoteReply || pickContextualReply(cleanText, thread?.contactName || '');

          const replyMsg = {
            id: `msg_reply_${Date.now()}`,
            threadId,
            text: replyText,
            sender: 'them',
            timestamp: formatShortTime(),
            status: 'read',
          };

          const afterReply = await storageService.saveMessage(threadId, replyMsg);
          if (isMountedRef.current) {
            setIsTyping(false);
            setMessages(afterReply);
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 60);
          }
        }, 1800);
        timersRef.current.push(replyTimer);
      }
    } catch {
      if (isMountedRef.current) setErrorMsg('Could not send message.');
    } finally {
      if (isMountedRef.current) setIsSending(false);
    }
  };

  const handleMessageLongPress = (msg) => {
    Alert.alert(
      'Message Options',
      msg.text.length > 60 ? `${msg.text.slice(0, 60)}...` : msg.text,
      [
        {
          text: 'Delete message',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await storageService.deleteMessage(threadId, msg.id);
              if (isMountedRef.current) setMessages(updated);
            } catch {
              if (isMountedRef.current) setErrorMsg('Failed to delete message.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTogglePin = async () => {
    if (!thread) return;
    try {
      await storageService.togglePin(thread.id);
      setThread((prev) => (prev ? { ...prev, isPinned: !prev.isPinned } : prev));
    } catch {
      setErrorMsg('Failed to update pin status.');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Messages',
      'Remove all messages in this conversation? This cannot be undone.',
      [
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearThreadMessages(threadId);
              if (isMountedRef.current) setMessages([]);
            } catch {
              setErrorMsg('Failed to clear messages.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteThread = () => {
    Alert.alert(
      'Delete Conversation',
      `Delete your entire conversation with ${thread?.contactName || 'this contact'}?`,
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteThread(threadId);
              router.replace('/');
            } catch {
              setErrorMsg('Failed to delete conversation.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView
      {...swipeBackResponder.panHandlers}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ChatHeader
          thread={thread}
          onBack={() => router.back()}
          onTitlePress={() => setOptionsVisible(true)}
          onMenuPress={() => setOptionsVisible(true)}
        />

        {errorMsg ? (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: `${theme.danger}15` },
            ]}>
            <Text style={[styles.errorText, { color: theme.danger }]}>
              {errorMsg}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View
            style={[
              styles.centerState,
              { backgroundColor: isDark ? theme.background : theme.cardSubtle },
            ]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.stateText, { color: theme.textSecondary }]}>
              Loading conversation...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            style={{ backgroundColor: isDark ? theme.background : theme.cardSubtle }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            renderItem={({ item, index }) => {
              const nextMsg = messages[index + 1];
              const isLastInGroup =
                !nextMsg ||
                nextMsg.sender !== item.sender ||
                nextMsg.timestamp !== item.timestamp;

              return (
                <MessageBubble
                  message={item}
                  isLastInGroup={isLastInGroup}
                  onLongPress={handleMessageLongPress}
                />
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={36}
                    color={theme.primary}
                  />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Start the conversation
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Send a text message to {thread?.contactName || 'this contact'} below.
                </Text>
              </View>
            }
            ListFooterComponent={
              isTyping ? (
                <View style={styles.typingRow}>
                  <View
                    style={[
                      styles.typingPill,
                      { backgroundColor: theme.incomingBubble },
                    ]}>
                    <Text
                      style={[styles.typingText, { color: theme.textSecondary }]}>
                      {thread?.contactName || 'Contact'} is typing...
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <ChatInputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          isSending={isSending}
        />

        <ChatOptionsModal
          visible={optionsVisible}
          thread={thread}
          onClose={() => setOptionsVisible(false)}
          onTogglePin={handleTogglePin}
          onClearHistory={handleClearHistory}
          onDeleteThread={handleDeleteThread}
        />
      </KeyboardAvoidingView>
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
  errorBanner: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContent: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    flexGrow: 1,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stateText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  typingRow: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
    alignItems: 'flex-start',
  },
  typingPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.bubble,
    borderBottomLeftRadius: 5,
  },
  typingText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
