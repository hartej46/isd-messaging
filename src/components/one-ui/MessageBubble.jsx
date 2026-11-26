import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

const WAVE_BARS = [8, 16, 12, 22, 14, 20, 10, 18, 13, 9];

function RichAttachmentContent({ text, isMe, theme }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (text.startsWith('📷 [Photo')) {
    return (
      <View style={styles.attachmentCard}>
        <View
          style={[
            styles.photoPlaceholder,
            {
              backgroundColor: isMe
                ? 'rgba(255,255,255,0.18)'
                : theme.backgroundElement,
            },
          ]}>
          <Ionicons
            name="image"
            size={36}
            color={isMe ? '#FFFFFF' : theme.primary}
          />
        </View>
        <View style={styles.attachmentFooter}>
          <Ionicons
            name="camera-outline"
            size={14}
            color={isMe ? '#FFFFFF' : theme.textSecondary}
          />
          <Text
            style={[
              styles.attachmentTitle,
              { color: isMe ? '#FFFFFF' : theme.text },
            ]}>
            Photo attachment
          </Text>
        </View>
      </View>
    );
  }

  if (text.startsWith('📍 [Shared')) {
    return (
      <View style={styles.locationCard}>
        <View
          style={[
            styles.locationIconBox,
            {
              backgroundColor: isMe
                ? 'rgba(255,255,255,0.2)'
                : `${theme.success}20`,
            },
          ]}>
          <Ionicons
            name="location"
            size={20}
            color={isMe ? '#FFFFFF' : theme.success}
          />
        </View>
        <View style={styles.locationMeta}>
          <Text
            style={[
              styles.attachmentTitle,
              { color: isMe ? '#FFFFFF' : theme.text },
            ]}>
            Current Location
          </Text>
          <Text
            style={[
              styles.locationSub,
              {
                color: isMe ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
              },
            ]}>
            Pinned map coordinates shared
          </Text>
        </View>
      </View>
    );
  }

  if (text.startsWith('🎤 [Voice')) {
    return (
      <Pressable
        style={styles.voiceRow}
        onPress={() => setIsPlaying((prev) => !prev)}>
        <View
          style={[
            styles.playCircle,
            {
              backgroundColor: isMe
                ? 'rgba(255,255,255,0.24)'
                : theme.primary,
            },
          ]}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={14}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.waveContainer}>
          {WAVE_BARS.map((height, idx) => (
            <View
              key={idx}
              style={[
                styles.waveBar,
                {
                  height,
                  backgroundColor: isMe
                    ? isPlaying && idx < 6
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.55)'
                    : isPlaying && idx < 6
                      ? theme.primary
                      : theme.textTertiary,
                },
              ]}
            />
          ))}
        </View>
        <Text
          style={[
            styles.voiceDuration,
            { color: isMe ? '#FFFFFF' : theme.textSecondary },
          ]}>
          {isPlaying ? '0:04' : '0:08'}
        </Text>
      </Pressable>
    );
  }

  return (
    <Text
      style={[
        styles.messageText,
        {
          color: isMe ? theme.outgoingBubbleText : theme.incomingBubbleText,
        },
      ]}>
      {text}
    </Text>
  );
}

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
          <RichAttachmentContent text={message.text} isMe={isMe} theme={theme} />
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
  attachmentCard: {
    width: 190,
    gap: 8,
  },
  photoPlaceholder: {
    height: 110,
    borderRadius: BorderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachmentTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 180,
  },
  locationIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationMeta: {
    flex: 1,
  },
  locationSub: {
    fontSize: 11,
    marginTop: 1,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 165,
  },
  playCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 11,
    fontWeight: '700',
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
