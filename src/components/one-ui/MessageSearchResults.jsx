import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SquircleAvatar } from './SquircleAvatar';

function HighlightedSnippet({ text, query, textColor, highlightColor }) {
  if (!query) {
    return (
      <Text style={[styles.snippetText, { color: textColor }]} numberOfLines={2}>
        {text}
      </Text>
    );
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return (
      <Text style={[styles.snippetText, { color: textColor }]} numberOfLines={2}>
        {text}
      </Text>
    );
  }

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + lowerQuery.length);
  const after = text.slice(matchIndex + lowerQuery.length);

  return (
    <Text style={[styles.snippetText, { color: textColor }]} numberOfLines={2}>
      {before}
      <Text style={[styles.highlight, { color: highlightColor }]}>{match}</Text>
      {after}
    </Text>
  );
}

export function MessageSearchResults({ matches, query, onSelectMatch }) {
  const theme = useTheme();

  if (!matches || matches.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
        MESSAGES ({matches.length})
      </Text>
      {matches.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: pressed ? theme.backgroundSelected : theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={() => onSelectMatch(item)}>
          <SquircleAvatar
            initials={item.thread.contactName}
            size={42}
            backgroundColor={item.thread.avatarColor}
          />
          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text
                style={[styles.contactName, { color: theme.text }]}
                numberOfLines={1}>
                {item.thread.contactName}
              </Text>
              <Text style={[styles.timestamp, { color: theme.textTertiary }]}>
                {item.message.timestamp}
              </Text>
            </View>
            <HighlightedSnippet
              text={
                item.message.sender === 'me'
                  ? `You: ${item.message.text}`
                  : item.message.text
              }
              query={query}
              textColor={theme.textSecondary}
              highlightColor={theme.primary}
            />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.three,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.two,
  },
  timestamp: {
    fontSize: 11,
  },
  snippetText: {
    fontSize: 13,
    lineHeight: 18,
  },
  highlight: {
    fontWeight: '800',
  },
});
