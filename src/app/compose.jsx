import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import { AVATAR_COLORS } from '@/services/mockData';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from '@/components/one-ui/SquircleAvatar';

function pickAvatarColor(name) {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) {
    sum += name.charCodeAt(i);
  }
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

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

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

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
          style={[
            styles.recipientContainer,
            { borderBottomColor: theme.border },
          ]}>
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

        <ScrollView
          style={styles.suggestionsScroll}
          contentContainerStyle={styles.suggestionsContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {!selectedContact && query.trim().length > 0 && !exactMatchExists ? (
            <Pressable
              style={({ pressed }) => [
                styles.customRecipientCard,
                {
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() =>
                handleSelectContact({
                  id: `custom_${Date.now()}`,
                  contactName: query.trim(),
                  phoneNumber: query.trim(),
                  avatarColor: pickAvatarColor(query.trim()),
                  category: 'personal',
                  hasExistingThread: false,
                })
              }>
              <View
                style={[styles.customIconCircle, { backgroundColor: theme.primary }]}>
                <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={[styles.customTitle, { color: theme.primaryDark }]}>
                  Send to &quot;{query.trim()}&quot;
                </Text>
                <Text style={[styles.customSub, { color: theme.primary }]}>
                  Tap to select new recipient
                </Text>
              </View>
            </Pressable>
          ) : null}

          {filteredRecent.length > 0 ? (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.textTertiary }]}>
                RECENT CONVERSATIONS
              </Text>
              {filteredRecent.map((contact) => {
                const isSelected = selectedContact?.id === contact.id;
                return (
                  <Pressable
                    key={contact.id}
                    style={({ pressed }) => [
                      styles.contactRow,
                      {
                        backgroundColor: isSelected
                          ? theme.primaryLight
                          : pressed
                            ? theme.backgroundElement
                            : 'transparent',
                      },
                    ]}
                    onPress={() => handleSelectContact(contact)}>
                    <SquircleAvatar
                      initials={contact.contactName}
                      size={42}
                      backgroundColor={contact.avatarColor}
                    />
                    <View style={styles.contactDetails}>
                      <Text style={[styles.contactName, { color: theme.text }]}>
                        {contact.contactName}
                      </Text>
                      <Text style={[styles.contactPhone, { color: theme.textSecondary }]}>
                        {contact.phoneNumber}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.openChatBadge,
                        { backgroundColor: theme.backgroundElement },
                      ]}
                      onPress={() => handleOpenExistingChat(contact)}
                      hitSlop={6}>
                      <Text style={[styles.openChatText, { color: theme.primary }]}>
                        Open
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={13}
                        color={theme.primary}
                      />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {filteredDirectory.length > 0 ? (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.textTertiary }]}>
                CONTACTS DIRECTORY
              </Text>
              {filteredDirectory.map((contact) => {
                const isSelected = selectedContact?.id === contact.id;
                return (
                  <Pressable
                    key={contact.id}
                    style={({ pressed }) => [
                      styles.contactRow,
                      {
                        backgroundColor: isSelected
                          ? theme.primaryLight
                          : pressed
                            ? theme.backgroundElement
                            : 'transparent',
                      },
                    ]}
                    onPress={() => handleSelectContact(contact)}>
                    <SquircleAvatar
                      initials={contact.contactName}
                      size={42}
                      backgroundColor={contact.avatarColor}
                    />
                    <View style={styles.contactDetails}>
                      <Text style={[styles.contactName, { color: theme.text }]}>
                        {contact.contactName}
                      </Text>
                      <Text style={[styles.contactPhone, { color: theme.textSecondary }]}>
                        {contact.phoneNumber}
                      </Text>
                    </View>
                    {contact.category === 'business' ? (
                      <View
                        style={[
                          styles.categoryPill,
                          { backgroundColor: theme.backgroundElement },
                        ]}>
                        <Text
                          style={[
                            styles.categoryPillText,
                            { color: theme.textSecondary },
                          ]}>
                          Business
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.bottomInputBar,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
            },
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
  suggestionsScroll: {
    flex: 1,
  },
  suggestionsContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  customRecipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    gap: Spacing.three,
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  customIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  customSub: {
    fontSize: 12,
    marginTop: 1,
  },
  sectionBlock: {
    marginBottom: Spacing.three,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginVertical: Spacing.two,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: Spacing.three,
    borderRadius: BorderRadius.medium,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 13,
    marginTop: 1,
  },
  openChatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    gap: 2,
  },
  openChatText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
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
