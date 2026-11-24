import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

export function MessageBubble({
  message,
  isLastInGroup = true,
  showDateBanner = false,
  dateBannerText = 'Today',
  onLongPress,
}) {
  const theme = useTheme();
  const isMe = message.sender === 'me';

  const statusLabel =
    message.status === 'read'
      ? 'Read'
      : message.status === 'delivered'
        ? 'Delivered'
        : 'Sent';

  return (
    <View style={styles.wrapper}>
      {showDateBanner ? (
        <View style={styles.dateBannerRow}>
          <View
            style={[
              styles.dateBannerPill,
              { backgroundColor: theme.backgroundElement },
            ]}>
            <Text style={[styles.dateBannerText, { color: theme.textSecondary }]}>
              {dateBannerText}
            </Text>
          </View>
        </View>
      ) : null}

      <View
        style={[
          styles.row,
          isMe ? styles.rowOutgoing : styles.rowIncoming,
          !isLastInGroup && styles.groupedSpacing,
        ]}>
        {/* Outgoing meta beside bubble (One UI SMS style) */}
        {isMe && isLastInGroup ? (
          <View style={[styles.metaContainer, styles.metaOutgoing]}>
            <View style={styles.statusRow}>
              <Ionicons
                name={message.status === 'read' ? 'checkmark-done' : 'checkmark'}
                size={11}
                color={message.status === 'read' ? theme.primary : theme.textTertiary}
              />
              <Text style={[styles.statusText, { color: theme.textTertiary }]}>
                {statusLabel}
              </Text>
            </View>
            <Text style={[styles.timestamp, { color: theme.textTertiary }]}>
              {message.timestamp}
            </Text>
          </View>
        ) : null}

        <Pressable
          onLongPress={() => onLongPress && onLongPress(message)}
          delayLongPress={350}
          style={({ pressed }) => [
            styles.bubble,
            isMe
              ? [
                  styles.bubbleOutgoing,
                  {
                    backgroundColor: theme.outgoingBubble,
                    borderBottomRightRadius: isLastInGroup ? 5 : BorderRadius.bubble,
                  },
                ]
              : [
                  styles.bubbleIncoming,
                  {
                    backgroundColor: theme.incomingBubble,
                    borderBottomLeftRadius: isLastInGroup ? 5 : BorderRadius.bubble,
                  },
                ],
            pressed && { opacity: 0.85 },
          ]}>
          <Text
            style={[
              styles.messageText,
              {
                color: isMe ? theme.outgoingBubbleText : theme.incomingBubbleText,
              },
            ]}>
            {message.text}
          </Text>
        </Pressable>

        {/* Incoming timestamp beside bubble */}
        {!isMe && isLastInGroup ? (
          <View style={[styles.metaContainer, styles.metaIncoming]}>
            <Text style={[styles.timestamp, { color: theme.textTertiary }]}>
              {message.timestamp}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  dateBannerRow: {
    alignItems: 'center',
    marginVertical: Spacing.three,
  },
  dateBannerPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
  },
  dateBannerText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: 6,
  },
  groupedSpacing: {
    marginBottom: 4,
  },
  rowOutgoing: {
    justifyContent: 'flex-end',
  },
  rowIncoming: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.bubble,
  },
  bubbleOutgoing: {
    borderTopRightRadius: BorderRadius.bubble,
    borderTopLeftRadius: BorderRadius.bubble,
    borderBottomLeftRadius: BorderRadius.bubble,
  },
  bubbleIncoming: {
    borderTopLeftRadius: BorderRadius.bubble,
    borderTopRightRadius: BorderRadius.bubble,
    borderBottomRightRadius: BorderRadius.bubble,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  metaContainer: {
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  metaOutgoing: {
    alignItems: 'flex-end',
  },
  metaIncoming: {
    alignItems: 'flex-start',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 10,
    fontWeight: '500',
  },
});
