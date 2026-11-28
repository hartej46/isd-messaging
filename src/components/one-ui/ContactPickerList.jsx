import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from './SquircleAvatar';
import { pickAvatarColor } from '@/utils/formatters';

function ContactRow({ contact, isSelected, onSelect, onOpenExisting }) {
  const theme = useTheme();
  return (
    <Pressable
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
      onPress={() => onSelect(contact)}>
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
      {onOpenExisting ? (
        <Pressable
          style={[
            styles.openChatBadge,
            { backgroundColor: theme.backgroundElement },
          ]}
          onPress={() => onOpenExisting(contact)}
          hitSlop={6}>
          <Text style={[styles.openChatText, { color: theme.primary }]}>
            Open
          </Text>
          <Ionicons name="chevron-forward" size={13} color={theme.primary} />
        </Pressable>
      ) : contact.category === 'business' ? (
        <View
          style={[
            styles.categoryPill,
            { backgroundColor: theme.backgroundElement },
          ]}>
          <Text
            style={[styles.categoryPillText, { color: theme.textSecondary }]}>
            Business
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function ContactPickerList({
  query,
  selectedContact,
  exactMatchExists,
  recentContacts,
  directoryContacts,
  onSelectContact,
  onOpenExistingChat,
}) {
  const theme = useTheme();
  const trimmed = query.trim();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {!selectedContact && trimmed.length > 0 && !exactMatchExists ? (
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
            onSelectContact({
              id: `custom_${Date.now()}`,
              contactName: trimmed,
              phoneNumber: trimmed,
              avatarColor: pickAvatarColor(trimmed),
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
              Send to &quot;{trimmed}&quot;
            </Text>
            <Text style={[styles.customSub, { color: theme.primary }]}>
              Tap to select new recipient
            </Text>
          </View>
        </Pressable>
      ) : null}

      {recentContacts.length > 0 ? (
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { color: theme.textTertiary }]}>
            RECENT CONVERSATIONS
          </Text>
          {recentContacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              isSelected={selectedContact?.id === contact.id}
              onSelect={onSelectContact}
              onOpenExisting={onOpenExistingChat}
            />
          ))}
        </View>
      ) : null}

      {directoryContacts.length > 0 ? (
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { color: theme.textTertiary }]}>
            CONTACTS DIRECTORY
          </Text>
          {directoryContacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              isSelected={selectedContact?.id === contact.id}
              onSelect={onSelectContact}
            />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
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
});
