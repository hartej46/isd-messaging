import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

const WAVE_BARS = [8, 16, 12, 22, 14, 20, 10, 18, 13, 9];
const EMOJI_ONLY_REGEX = /^[\p{Extended_Pictographic}\u200D\uFE0F\s]+$/u;

function checkEmojiOnly(text) {
  const trimmed = (text || '').trim();
  if (!trimmed || trimmed.length > 8) return false;
  return EMOJI_ONLY_REGEX.test(trimmed);
}

function RichAttachmentContent({ message, isMe, theme }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const text = message?.text || '';

  if (message?.imageUri) {
    const caption = text && text !== '[Photo attachment]' ? text : null;
    return (
      <View style={styles.imageBubbleContent}>
        <Image
          source={{ uri: message.imageUri }}
          style={styles.attachedImage}
          resizeMode="cover"
        />
        {caption ? (
          <Text
            style={[
              styles.body,
              {
                color: isMe ? theme.outgoingBubbleText : theme.incomingBubbleText,
                marginTop: 6,
              },
            ]}>
            {caption}
          </Text>
        ) : null}
      </View>
    );
  }

  if (text.startsWith('[Photo')) {
    return (
      <View style={styles.attachmentCard}>
        <View
          style={[
            styles.photoPlaceholder,
            {
              backgroundColor: isMe
                ? 'rgba(14,52,56,0.1)'
                : theme.backgroundElement,
            },
          ]}>
          <Ionicons
            name="image"
            size={36}
            color={isMe ? theme.outgoingBubbleText : theme.primary}
          />
        </View>
        <View style={styles.attachmentFooter}>
          <Ionicons
            name="camera-outline"
            size={14}
            color={isMe ? theme.outgoingBubbleText : theme.textSecondary}
          />
          <Text
            style={[
              styles.attachmentTitle,
              { color: isMe ? theme.outgoingBubbleText : theme.text },
            ]}>
            Photo attachment
          </Text>
        </View>
      </View>
    );
  }

  if (text.startsWith('[Shared')) {
    return (
      <View style={styles.locationCard}>
        <View
          style={[
            styles.locationIconBox,
            {
              backgroundColor: isMe
                ? 'rgba(14,52,56,0.12)'
                : `${theme.primary}20`,
            },
          ]}>
          <Ionicons
            name="location"
            size={20}
            color={isMe ? theme.outgoingBubbleText : theme.primary}
          />
        </View>
        <View style={styles.locationMeta}>
          <Text
            style={[
              styles.attachmentTitle,
              { color: isMe ? theme.outgoingBubbleText : theme.text },
            ]}>
            Current Location
          </Text>
          <Text
            style={[
              styles.locationSub,
              {
                color: isMe ? theme.outgoingBubbleText : theme.textSecondary,
                opacity: isMe ? 0.78 : 1,
              },
            ]}>
            Pinned map coordinates shared
          </Text>
        </View>
      </View>
    );
  }

  if (text.startsWith('[Voice')) {
    return (
      <Pressable
        style={styles.voiceRow}
        onPress={() => setIsPlaying((prev) => !prev)}>
        <View
          style={[
            styles.playCircle,
            {
              backgroundColor: theme.primary,
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
                  backgroundColor:
                    isPlaying && idx < 6
                      ? theme.primary
                      : isMe
                        ? theme.outgoingBubbleText
                        : theme.textTertiary,
                  opacity: isPlaying && idx < 6 ? 1 : isMe ? 0.55 : 1,
                },
              ]}
            />
          ))}
        </View>
        <Text
          style={[
            styles.voiceDuration,
            { color: isMe ? theme.outgoingBubbleText : theme.textSecondary },
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
  onLongPress,
}) {
  const theme = useTheme();
  const isMe = message.sender === 'me';
  const isEmojiOnly = checkEmojiOnly(message.text);

  return (
    <View
      style={[
        styles.row,
        isMe ? styles.rowOutgoing : styles.rowIncoming,
        isLastInGroup ? styles.groupEndSpacing : styles.groupedSpacing,
      ]}>
      {isMe && isLastInGroup ? (
        <View style={styles.metaContainer}>
          <Text style={[styles.timestamp, { color: theme.textTertiary }]}>
            {message.timestamp}
          </Text>
        </View>
      ) : null}

      <Pressable
        onLongPress={() => onLongPress && onLongPress(message)}
        delayLongPress={350}
        style={({ pressed }) => [
          isEmojiOnly
            ? styles.emojiContainer
            : [
                styles.bubble,
                {
                  backgroundColor: isMe
                    ? theme.outgoingBubble
                    : theme.incomingBubble,
                },
              ],
          pressed && { opacity: 0.85 },
        ]}>
        {isEmojiOnly ? (
          <Text style={styles.emojiOnlyText}>{message.text.trim()}</Text>
        ) : (
          <RichAttachmentContent message={message} isMe={isMe} theme={theme} />
        )}
      </Pressable>

      {!isMe && isLastInGroup ? (
        <View style={styles.metaContainer}>
          <Text style={[styles.timestamp, { color: theme.textTertiary }]}>
            {message.timestamp}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.three,
    gap: 6,
  },
  groupedSpacing: {
    marginBottom: 4,
  },
  groupEndSpacing: {
    marginBottom: 14,
  },
  rowOutgoing: {
    justifyContent: 'flex-end',
  },
  rowIncoming: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '72%',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  emojiContainer: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  emojiOnlyText: {
    fontSize: 48,
    lineHeight: 56,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
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
  imageBubbleContent: {
    width: 220,
  },
  attachedImage: {
    width: 220,
    height: 170,
    borderRadius: 14,
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
  timestamp: {
    fontSize: 11,
    fontWeight: '400',
  },
});
