import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Phone, RefreshCw, Users } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { dialPhoneNumber } from '@/utils/phone';
import { SquircleAvatar } from './SquircleAvatar';

export function ContactsCallList({
  contacts,
  scrollY,
  onSyncContacts,
  syncingContacts = false,
  syncStatusText,
  onOpenContactChat,
}) {
  const theme = useTheme();

  const renderSyncHeader = () => {
    if (!onSyncContacts) return null;
    return (
      <View
        style={[
          styles.syncCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <View style={[styles.syncIconBox, { backgroundColor: theme.primaryLight }]}>
          <Users size={20} color={theme.primary} strokeWidth={2.1} />
        </View>
        <View style={styles.meta}>
          <Text style={[styles.name, { color: theme.text }]}>Device Contacts</Text>
          <Text style={[styles.number, { color: theme.textSecondary }]}>
            {syncStatusText || 'Sync phone contacts to message or call'}
          </Text>
        </View>
        <Pressable
          disabled={syncingContacts}
          onPress={onSyncContacts}
          style={({ pressed }) => [
            styles.syncBtn,
            { backgroundColor: theme.primary },
            pressed && { opacity: 0.85 },
            syncingContacts && { opacity: 0.65 },
          ]}>
          {syncingContacts ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <RefreshCw size={14} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.syncBtnText}>Sync</Text>
            </>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <Animated.FlatList
      data={contacts}
      keyExtractor={(item) => item.id}
      style={styles.flex}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderSyncHeader}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      renderItem={({ item, index }) => {
        const isFirst = index === 0;
        const isLast = index === contacts.length - 1;
        return (
          <Pressable
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: pressed ? theme.backgroundSelected : theme.card,
                borderTopLeftRadius: isFirst ? 26 : 0,
                borderTopRightRadius: isFirst ? 26 : 0,
                borderBottomLeftRadius: isLast ? 26 : 0,
                borderBottomRightRadius: isLast ? 26 : 0,
              },
            ]}
            onPress={() => {
              if (onOpenContactChat) {
                onOpenContactChat(item);
                return;
              }
              dialPhoneNumber(item.phoneNumber, item.contactName);
            }}>
            <SquircleAvatar
              name={item.contactName}
              color={item.avatarColor}
              avatarUrl={item.avatarUrl}
              size={44}
            />
            <View style={styles.meta}>
              <Text style={[styles.name, { color: theme.text }]}>
                {item.contactName}
              </Text>
              <Text style={[styles.number, { color: theme.textSecondary }]}>
                {item.phoneNumber}
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation();
                dialPhoneNumber(item.phoneNumber, item.contactName);
              }}
              style={[styles.callBtn, { backgroundColor: theme.primaryLight }]}>
              <Phone size={18} color={theme.primary} strokeWidth={2.2} />
            </Pressable>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 86,
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  syncIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: 13,
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meta: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  number: {
    fontSize: 13,
    marginTop: 2,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
