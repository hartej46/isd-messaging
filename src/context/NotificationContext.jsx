import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform, Vibration } from 'react-native';

import { useSettings } from '@/context/SettingsContext';
import { chatApi } from '@/services/chatApi';
import { storageService } from '@/services/storage';
import { formatShortTime, pickAvatarColor } from '@/utils/formatters';
import { pickContextualReply } from '@/utils/replyGenerator';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const settingsContext = useSettings();
  const notificationsEnabled = settingsContext?.settings?.notifications ?? true;

  const [activeNotification, setActiveNotification] = useState(null);
  const [typingThreadId, setTypingThreadId] = useState(null);

  const activeThreadIdRef = useRef(null);
  const dismissTimerRef = useRef(null);
  const pendingTimersRef = useRef([]);
  const listenersRef = useRef(new Set());

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const timers = pendingTimersRef.current;
    return () => {
      clearDismissTimer();
      timers.forEach(clearTimeout);
    };
  }, [clearDismissTimer]);

  const subscribeIncoming = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const setActiveThreadId = useCallback((threadId) => {
    activeThreadIdRef.current = threadId || null;
    if (threadId) {
      setActiveNotification((prev) =>
        prev && prev.threadId === threadId ? null : prev
      );
    }
  }, []);

  const dismissNotification = useCallback(() => {
    clearDismissTimer();
    setActiveNotification(null);
  }, [clearDismissTimer]);

  const showNotification = useCallback(
    (payload, options = {}) => {
      const { force = false } = options;
      if (!force && !notificationsEnabled) return;
      if (!force && activeThreadIdRef.current === payload.threadId) return;

      clearDismissTimer();

      if (Platform.OS !== 'web') {
        Vibration.vibrate(40);
      }

      setActiveNotification({
        id: `notif_${Date.now()}`,
        threadId: payload.threadId,
        senderName: payload.senderName || 'New Message',
        avatarColor: payload.avatarColor || pickAvatarColor(payload.senderName || ''),
        avatarUrl: payload.avatarUrl || null,
        messageText: payload.messageText || '',
        timestamp: payload.timestamp || 'now',
      });

      dismissTimerRef.current = setTimeout(() => {
        setActiveNotification(null);
        dismissTimerRef.current = null;
      }, 4000);
    },
    [clearDismissTimer, notificationsEnabled]
  );

  const deliverIncomingMessage = useCallback(
    async ({ threadId, senderName, avatarColor, avatarUrl, text, forceBanner = false }) => {
      const isViewingThread = activeThreadIdRef.current === threadId;
      const timestamp = formatShortTime();
      const incomingMsg = {
        id: `msg_reply_${Date.now()}`,
        threadId,
        text,
        sender: 'them',
        timestamp,
        status: isViewingThread ? 'read' : 'delivered',
      };

      const updatedMessages = await storageService.saveMessage(threadId, incomingMsg, {
        incrementUnread: !isViewingThread,
      });

      const event = {
        threadId,
        messages: updatedMessages,
        timestamp: Date.now(),
      };
      listenersRef.current.forEach((listener) => listener(event));

      showNotification(
        {
          threadId,
          senderName,
          avatarColor,
          avatarUrl,
          messageText: text,
          timestamp: 'now',
        },
        { force: forceBanner }
      );

      return updatedMessages;
    },
    [showNotification]
  );

  const scheduleIncomingReply = useCallback(
    ({ threadId, contactName, avatarColor, avatarUrl, outgoingText, outgoingMessageId }) => {
      const typingTimer = setTimeout(() => {
        setTypingThreadId(threadId);
      }, 700);
      pendingTimersRef.current.push(typingTimer);

      const replyTimer = setTimeout(async () => {
        try {
          if (outgoingMessageId) {
            await storageService.updateMessageStatus(threadId, outgoingMessageId, 'read');
          }
          const remoteReply = await chatApi.fetchRandomReply();
          const replyText = remoteReply || pickContextualReply(outgoingText, contactName || '');

          setTypingThreadId((prev) => (prev === threadId ? null : prev));

          await deliverIncomingMessage({
            threadId,
            senderName: contactName,
            avatarColor,
            avatarUrl,
            text: replyText,
          });
        } catch (err) {
          console.error('Failed to deliver simulated reply:', err);
          setTypingThreadId((prev) => (prev === threadId ? null : prev));
        }
      }, 1800);
      pendingTimersRef.current.push(replyTimer);
    },
    [deliverIncomingMessage]
  );

  const triggerDemoNotification = useCallback(async () => {
    const threads = await storageService.getThreads();
    const target = threads[0];
    if (!target) {
      showNotification(
        {
          threadId: 'demo',
          senderName: 'Alex Morgan',
          messageText: 'Hey! Just checking if you got my last message.',
          timestamp: 'now',
        },
        { force: true }
      );
      return;
    }

    const sampleTexts = [
      'Hey! Are you free for a quick chat?',
      'Just sent over the latest updates.',
      'Let me know when you see this!',
    ];
    const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];

    await deliverIncomingMessage({
      threadId: target.id,
      senderName: target.contactName,
      avatarColor: target.avatarColor,
      avatarUrl: target.avatarUrl || null,
      text,
      forceBanner: true,
    });
  }, [deliverIncomingMessage, showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        activeNotification,
        typingThreadId,
        subscribeIncoming,
        setActiveThreadId,
        showNotification,
        dismissNotification,
        scheduleIncomingReply,
        triggerDemoNotification,
      }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
