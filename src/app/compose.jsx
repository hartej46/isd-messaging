import React, { useState } from 'react';
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
import { router } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from '@/components/one-ui/SquircleAvatar';

export default function ComposeScreen() {
  const theme = useTheme();
  const [recipient, setRecipient] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [existingContacts, setExistingContacts] = useState([]);

  React.useEffect(() => {
    storageService.getThreads().then((threads) => {
      setExistingContacts(threads);
    });
  }, []);

  const handleSelectContact = (contact) => {
    setRecipient(contact.contactName);
  };

  const handleSendMessage = async () => {
    const cleanRecipient = recipient.trim();
    const cleanText = messageText.trim();

    if (!cleanRecipient || !cleanText || isSending) return;

    setIsSending(true);

    try {
      // Find if thread exists
      const threads = await storageService.getThreads();
      let matchedThread = threads.find(
        (t) =>
          t.contactName.toLowerCase() === cleanRecipient.toLowerCase() ||
          t.phoneNumber === cleanRecipient
      );

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (!matchedThread) {
        // Create new thread
        matchedThread = {
          id: `thread_${Date.now()}`,
          contactName: cleanRecipient,
          phoneNumber: cleanRecipient.includes('@') ? cleanRecipient : '+1 (555) 000-0000',
          avatarColor: '#1C68F3',
          lastMessage: cleanText,
          timestamp: timeStr,
          unreadCount: 0,
          isPinned: false,
          category: 'personal',
        };
        await storageService.upsertThread(matchedThread);
      }

      // Save message in thread
      const newMessage = {
        id: `msg_${Date.now()}`,
        threadId: matchedThread.id,
        text: cleanText,
        sender: 'me',
        timestamp: timeStr,
        status: 'sent',
      };

      await storageService.saveMessage(matchedThread.id, newMessage);
      router.replace('/');
    } catch (err) {
      console.error('Failed to create message thread:', err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredContacts = existingContacts.filter((c) =>
    recipient
      ? c.contactName.toLowerCase().includes(recipient.toLowerCase()) ||
        c.phoneNumber.includes(recipient)
      : true
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* One UI App Bar */}
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

        {/* Recipient Input */}
        <View
          style={[
            styles.recipientContainer,
            { borderBottomColor: theme.border },
          ]}>
          <Text style={[styles.toLabel, { color: theme.textSecondary }]}>To</Text>
          <TextInput
            style={[styles.recipientInput, { color: theme.text }]}
            placeholder="Type a name, phone number, or email"
            placeholderTextColor={theme.textTertiary}
            value={recipient}
            onChangeText={setRecipient}
            autoFocus
          />
        </View>

        {/* Contact Suggestions List */}
        <ScrollView
          style={styles.suggestionsScroll}
          keyboardShouldPersistTaps="handled">
          <Text style={[styles.sectionHeading, { color: theme.textTertiary }]}>
            FREQUENT CONTACTS
          </Text>
          {filteredContacts.map((contact) => (
            <Pressable
              key={contact.id}
              style={({ pressed }) => [
                styles.contactRow,
                pressed && { backgroundColor: theme.backgroundElement },
              ]}
              onPress={() => handleSelectContact(contact)}>
              <SquircleAvatar
                initials={contact.contactName}
                size={40}
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
            </Pressable>
          ))}
        </ScrollView>

        {/* Message Input Bar */}
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
              placeholder="Enter message"
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
                    messageText.trim() && recipient.trim()
                      ? theme.primary
                      : theme.textTertiary,
                },
              ]}
              disabled={!messageText.trim() || !recipient.trim() || isSending}
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
  },
  toLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  recipientInput: {
    flex: 1,
    fontSize: 15,
    height: 40,
  },
  suggestionsScroll: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
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
