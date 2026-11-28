import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage';
import { chatApi } from '@/services/chatApi';
import { formatShortTime, pickAvatarColor } from '@/utils/formatters';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from '@/components/one-ui/SquircleAvatar';
import { ContactPickerList } from '@/components/one-ui/ContactPickerList';

export default function ComposeScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const initialRecipient = Array.isArray(params.recipient)
    ? params.recipient[0]
    : params.recipient;

  const [query, setQuery] = useState(initialRecipient || '');
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [contacts, setContacts] = useState({ recent: [], directory: [] });

  useEffect(() => {
    let isMounted = true;
    storageService
      .getAllContacts()
      .then((data) => {
        if (!isMounted) return;
        setContacts(data);
        if (initialRecipient) {
          const all = [...data.recent, ...data.directory];
          const match = all.find(
            (c) => c.contactName.toLowerCase() === initialRecipient.toLowerCase()
          );
          if (match) {
            setSelectedContact(match);
            setQuery('');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load contacts:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [initialRecipient]);

  const effectiveRecipientName = selectedContact
    ? selectedContact.contactName
    : query.trim();

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setQuery('');
  };

  const handleClearRecipient = () => {
    setSelectedContact(null);
    setQuery('');
  };

  const handleOpenExistingChat = (contact) => {
    if (contact.threadId) {
      router.replace(`/chat/${contact.threadId}`);
    }
  };

  const handleSendMessage = async () => {
    const cleanRecipient = effectiveRecipientName;
    const cleanText = messageText.trim();

    if (!cleanRecipient || !cleanText || isSending) return;

    setIsSending(true);

    try {
      const threads = await storageService.getThreads();
      let matchedThread = threads.find(
        (t) =>
          t.contactName.toLowerCase() === cleanRecipient.toLowerCase() ||
          t.phoneNumber === cleanRecipient
      );

      const timeStr = formatShortTime();

      if (!matchedThread) {
        matchedThread = {
          id: `thread_${Date.now()}`,
          contactName: cleanRecipient,
          phoneNumber:
            selectedContact?.phoneNumber ||
            (cleanRecipient.includes('@') || /\d{4,}/.test(cleanRecipient)
              ? cleanRecipient
              : '+1 (555) 019-2834'),
          avatarColor:
            selectedContact?.avatarColor || pickAvatarColor(cleanRecipient),
          lastMessage: cleanText,
          timestamp: timeStr,
          unreadCount: 0,
          isPinned: false,
          category: selectedContact?.category || 'personal',
        };
        await storageService.upsertThread(matchedThread);
      }

      const newMessage = {
        id: `msg_${Date.now()}`,
        threadId: matchedThread.id,
        text: cleanText,
        sender: 'me',
        timestamp: timeStr,
        status: 'sent',
      };

      await storageService.saveMessage(matchedThread.id, newMessage);
      chatApi.postSimulatedMessage(cleanText);
      router.replace(`/chat/${matchedThread.id}`);
    } catch (err) {
      console.error('Failed to create message thread:', err);
    } finally {
      setIsSending(false);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();

  const filteredRecent = useMemo(
    () =>
      contacts.recent.filter((c) =>
        normalizedQuery
          ? c.contactName.toLowerCase().includes(normalizedQuery) ||
            c.phoneNumber.toLowerCase().includes(normalizedQuery)
          : true
      ),
    [contacts.recent, normalizedQuery]
  );

  const filteredDirectory = useMemo(
    () =>
      contacts.directory.filter((c) =>
        normalizedQuery
          ? c.contactName.toLowerCase().includes(normalizedQuery) ||
            c.phoneNumber.toLowerCase().includes(normalizedQuery)
          : true
      ),
    [contacts.directory, normalizedQuery]
  );

  const exactMatchExists = useMemo(() => {
    if (!normalizedQuery) return true;
    return [...contacts.recent, ...contacts.directory].some(
      (c) =>
        c.contactName.toLowerCase() === normalizedQuery ||
        c.phoneNumber.toLowerCase() === normalizedQuery
    );
  }, [contacts, normalizedQuery]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.appBar}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>New message</Text>
          <View style={styles.placeholder} />
        </View>

        <View
          style={[styles.recipientContainer, { borderBottomColor: theme.border }]}>
          <Text style={[styles.toLabel, { color: theme.textSecondary }]}>To</Text>
          {selectedContact ? (
            <View
              style={[
                styles.recipientChip,
                {
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.primary,
                },
              ]}>
              <SquircleAvatar
                initials={selectedContact.contactName}
                size={24}
                backgroundColor={selectedContact.avatarColor}
              />
              <Text style={[styles.chipName, { color: theme.primaryDark }]}>
                {selectedContact.contactName}
              </Text>
              <Pressable onPress={handleClearRecipient} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={theme.primary} />
              </Pressable>
            </View>
          ) : (
            <TextInput
              style={[styles.recipientInput, { color: theme.text }]}
              placeholder="Enter name, phone number, or email"
              placeholderTextColor={theme.textTertiary}
              value={query}
              onChangeText={setQuery}
              autoFocus={!initialRecipient}
            />
          )}
        </View>

        <ContactPickerList
          query={query}
          selectedContact={selectedContact}
          exactMatchExists={exactMatchExists}
          recentContacts={filteredRecent}
          directoryContacts={filteredDirectory}
          onSelectContact={handleSelectContact}
          onOpenExistingChat={handleOpenExistingChat}
        />

        <View
          style={[
            styles.bottomInputBar,
            { backgroundColor: theme.card, borderTopColor: theme.border },
          ]}>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
              },
            ]}>
            <TextInput
              style={[styles.msgInput, { color: theme.text }]}
              placeholder={
                effectiveRecipientName
                  ? `Message ${effectiveRecipientName}`
                  : 'Enter message'
              }
              placeholderTextColor={theme.textTertiary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <Pressable
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    messageText.trim() && effectiveRecipientName
                      ? theme.primary
                      : theme.textTertiary,
                },
              ]}
              disabled={!messageText.trim() || !effectiveRecipientName || isSending}
              onPress={handleSendMessage}>
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
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
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  backBtn: {
    padding: Spacing.one,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  placeholder: {
    width: 32,
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.two,
    minHeight: 56,
  },
  toLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    gap: 8,
  },
  chipName: {
    fontSize: 14,
    fontWeight: '700',
  },
  recipientInput: {
    flex: 1,
    fontSize: 15,
    height: 40,
  },
  bottomInputBar: {
    padding: Spacing.three,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.pill,
    paddingLeft: Spacing.three,
    paddingRight: 6,
    paddingVertical: 4,
    borderWidth: 1,
    minHeight: 46,
  },
  msgInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
