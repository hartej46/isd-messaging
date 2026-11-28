import React from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Phone, User } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function ContactsCallList({ contacts, scrollY }) {
  const theme = useTheme();

  return (
    <Animated.FlatList
      data={contacts}
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
            onPress={() =>
              Alert.alert(
                'Voice Call',
                `Calling ${item.contactName} (${item.phoneNumber})...`
              )
            }>
            <View
              style={[styles.avatar, { backgroundColor: theme.accentSurface }]}>
              <User size={21} color={theme.accentOnSurface} strokeWidth={2.1} />
            </View>
            <View style={styles.meta}>
              <Text style={[styles.name, { color: theme.text }]}>
                {item.contactName}
              </Text>
              <Text style={[styles.number, { color: theme.textSecondary }]}>
                {item.phoneNumber}
              </Text>
            </View>
            <View
              style={[styles.callBtn, { backgroundColor: theme.primaryLight }]}>
              <Phone size={18} color={theme.primary} strokeWidth={2.2} />
            </View>
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
