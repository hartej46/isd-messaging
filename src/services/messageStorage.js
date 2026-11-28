import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DIRECTORY_CONTACTS,
  INITIAL_MESSAGES,
  INITIAL_THREADS,
} from './mockData';
import { chatApi } from './chatApi';
import { fetchDeviceContacts } from './deviceContacts';
import { STORAGE_KEYS, readJson, removeKey, writeJson } from './storageHelpers';

function threadMessagesKey(threadId) {
  return `${STORAGE_KEYS.THREAD_MESSAGES_PREFIX}${threadId}`;
}

async function applySeedPayload(threads, messagesByThread, directoryContacts) {
  await writeJson(STORAGE_KEYS.THREADS, threads);
  await writeJson(STORAGE_KEYS.API_DIRECTORY, directoryContacts);
  await Promise.all(
    Object.entries(messagesByThread).map(([threadId, msgs]) =>
      writeJson(threadMessagesKey(threadId), msgs)
    )
  );
  await AsyncStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
}

export const messageStorage = {
  async getThreads() {
    const existing = await readJson(STORAGE_KEYS.THREADS, null);
    if (!existing) {
      await this.seedInitialData();
      return readJson(STORAGE_KEYS.THREADS, []);
    }
    return existing;
  },

  saveThreads(threads) {
    return writeJson(STORAGE_KEYS.THREADS, threads);
  },

  async upsertThread(thread) {
    const threads = await this.getThreads();
    const filtered = threads.filter((t) => t.id !== thread.id);
    const nextThread = {
      ...thread,
      updatedAt: thread.updatedAt || Date.now(),
    };
    const updated = [nextThread, ...filtered];
    await this.saveThreads(updated);
    return updated;
  },

  async deleteThread(threadId) {
    const threads = await this.getThreads();
    const filtered = threads.filter((t) => t.id !== threadId);
    await this.saveThreads(filtered);
    await removeKey(threadMessagesKey(threadId));
    return filtered;
  },

  async togglePin(threadId) {
    const threads = await this.getThreads();
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, isPinned: !t.isPinned } : t
    );
    await this.saveThreads(updated);
    return updated;
  },

  async toggleRead(threadId) {
    const threads = await this.getThreads();
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, unreadCount: t.unreadCount > 0 ? 0 : 1 } : t
    );
    await this.saveThreads(updated);
    return updated;
  },

  async markAllAsRead() {
    const threads = await this.getThreads();
    const updated = threads.map((t) => ({ ...t, unreadCount: 0 }));
    await this.saveThreads(updated);
    return updated;
  },

  async getThreadById(threadId) {
    const threads = await this.getThreads();
    return threads.find((t) => t.id === threadId) || null;
  },

  async markThreadAsRead(threadId) {
    const threads = await this.getThreads();
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, unreadCount: 0 } : t
    );
    await this.saveThreads(updated);
    return updated;
  },

  async getMessages(threadId) {
    const key = threadMessagesKey(threadId);
    const stored = await readJson(key, null);
    if (!stored) {
      const initial = INITIAL_MESSAGES[threadId] || [];
      if (initial.length > 0) {
        await writeJson(key, initial);
      }
      return initial;
    }
    return stored;
  },

  async saveMessage(threadId, message, options = {}) {
    const { incrementUnread = false } = options;
    const current = await this.getMessages(threadId);
    const updated = [...current, message];
    await writeJson(threadMessagesKey(threadId), updated);

    const threads = await this.getThreads();
    const threadIndex = threads.findIndex((t) => t.id === threadId);
    if (threadIndex >= 0) {
      const existing = threads[threadIndex];
      const movedThread = {
        ...existing,
        lastMessage: message.text,
        timestamp: message.timestamp,
        updatedAt: Date.now(),
        unreadCount: incrementUnread ? (existing.unreadCount || 0) + 1 : existing.unreadCount,
      };
      const remaining = threads.filter((t) => t.id !== threadId);
      await this.saveThreads([movedThread, ...remaining]);
    }

    return updated;
  },

  async updateMessageStatus(threadId, messageId, status) {
    const current = await this.getMessages(threadId);
    const updated = current.map((m) =>
      m.id === messageId ? { ...m, status } : m
    );
    await writeJson(threadMessagesKey(threadId), updated);
    return updated;
  },

  async deleteMessage(threadId, messageId) {
    const current = await this.getMessages(threadId);
    const updated = current.filter((m) => m.id !== messageId);
    await writeJson(threadMessagesKey(threadId), updated);

    const threads = await this.getThreads();
    const threadIndex = threads.findIndex((t) => t.id === threadId);
    if (threadIndex >= 0) {
      const lastMsg = updated[updated.length - 1];
      threads[threadIndex].lastMessage = lastMsg
        ? lastMsg.text
        : 'No messages yet';
      if (lastMsg) {
        threads[threadIndex].timestamp = lastMsg.timestamp;
      }
      await this.saveThreads(threads);
    }

    return updated;
  },

  async clearThreadMessages(threadId) {
    await writeJson(threadMessagesKey(threadId), []);
    const threads = await this.getThreads();
    const threadIndex = threads.findIndex((t) => t.id === threadId);
    if (threadIndex >= 0) {
      threads[threadIndex].lastMessage = 'No messages yet';
      await this.saveThreads(threads);
    }
    return [];
  },

  async searchAllMessages(query) {
    const cleanQuery = (query || '').trim().toLowerCase();
    if (!cleanQuery) return [];

    const threads = await this.getThreads();
    const results = [];

    await Promise.all(
      threads.map(async (thread) => {
        const msgs = await this.getMessages(thread.id);
        for (const msg of msgs) {
          if (msg.text && msg.text.toLowerCase().includes(cleanQuery)) {
            results.push({
              id: `${thread.id}_${msg.id}`,
              message: msg,
              thread,
            });
          }
        }
      })
    );

    return results;
  },

  async getAllContacts() {
    const threads = await this.getThreads();
    const existingNames = new Set(
      threads.map((t) => t.contactName.toLowerCase())
    );

    const [devicePool, directoryPool] = await Promise.all([
      readJson(STORAGE_KEYS.DEVICE_CONTACTS, []),
      readJson(STORAGE_KEYS.API_DIRECTORY, DIRECTORY_CONTACTS),
    ]);

    const seenDirectoryNames = new Set(existingNames);
    const newContacts = [];

    for (const c of [...devicePool, ...directoryPool]) {
      const key = (c.contactName || '').toLowerCase();
      if (!key || seenDirectoryNames.has(key)) continue;
      seenDirectoryNames.add(key);
      newContacts.push({ ...c, hasExistingThread: false });
    }

    const recentContacts = threads.map((t) => ({
      id: t.id,
      threadId: t.id,
      contactName: t.contactName,
      phoneNumber: t.phoneNumber,
      avatarColor: t.avatarColor,
      category: t.category,
      hasExistingThread: true,
    }));

    return {
      recent: recentContacts,
      directory: newContacts,
    };
  },

  async syncDeviceContacts() {
    const result = await fetchDeviceContacts();
    if (!result.supported || result.status !== 'granted') {
      return {
        supported: result.supported,
        status: result.status,
        count: 0,
        syncedAt: null,
      };
    }

    const syncedAt = new Date().toISOString();
    await Promise.all([
      writeJson(STORAGE_KEYS.DEVICE_CONTACTS, result.contacts),
      writeJson(STORAGE_KEYS.CONTACTS_SYNCED_AT, syncedAt),
    ]);

    return {
      supported: true,
      status: 'granted',
      count: result.contacts.length,
      syncedAt,
    };
  },

  async getDeviceContactsMeta() {
    const [contacts, syncedAt] = await Promise.all([
      readJson(STORAGE_KEYS.DEVICE_CONTACTS, []),
      readJson(STORAGE_KEYS.CONTACTS_SYNCED_AT, null),
    ]);
    return {
      count: Array.isArray(contacts) ? contacts.length : 0,
      syncedAt,
    };
  },

  async seedInitialData(force = false) {
    const isSeeded = await AsyncStorage.getItem(STORAGE_KEYS.SEEDED);
    if (isSeeded && !force) return;

    let threadsToSave = INITIAL_THREADS;
    let messagesToSave = INITIAL_MESSAGES;
    let directoryToSave = DIRECTORY_CONTACTS;

    try {
      const remote = await chatApi.fetchRemoteThreadsAndContacts();
      if (remote.threads.length > 0) {
        threadsToSave = remote.threads;
        messagesToSave = remote.messagesByThread;
        if (remote.directoryContacts.length > 0) {
          directoryToSave = remote.directoryContacts;
        }
      }
    } catch {
      threadsToSave = INITIAL_THREADS;
      messagesToSave = INITIAL_MESSAGES;
      directoryToSave = DIRECTORY_CONTACTS;
    }

    await applySeedPayload(threadsToSave, messagesToSave, directoryToSave);
  },

  async syncWithRemoteApi() {
    const remote = await chatApi.fetchRemoteThreadsAndContacts();
    const existingKeys = await AsyncStorage.getAllKeys();
    const msgKeys = existingKeys.filter((k) => k.startsWith('@messages_'));
    if (msgKeys.length > 0) {
      await AsyncStorage.multiRemove(msgKeys);
    }
    await applySeedPayload(
      remote.threads,
      remote.messagesByThread,
      remote.directoryContacts
    );
    return remote.threads;
  },

  async resetAllData() {
    const keys = await AsyncStorage.getAllKeys();
    const msgKeys = keys.filter(
      (k) =>
        k.startsWith('@messages_') ||
        k === STORAGE_KEYS.SEEDED ||
        k === STORAGE_KEYS.API_DIRECTORY
    );
    if (msgKeys.length > 0) {
      await AsyncStorage.multiRemove(msgKeys);
    }
    await this.seedInitialData(true);
  },

  async clearAllThreadsAndMessages() {
    const keys = await AsyncStorage.getAllKeys();
    const msgKeys = keys.filter((k) => k.startsWith('@messages_'));
    if (msgKeys.length > 0) {
      await AsyncStorage.multiRemove(msgKeys);
    }
    await writeJson(STORAGE_KEYS.THREADS, []);
    await AsyncStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  },

  async getStorageStats() {
    const threads = await this.getThreads();
    let totalMessages = 0;
    await Promise.all(
      threads.map(async (t) => {
        const msgs = await this.getMessages(t.id);
        totalMessages += msgs.length;
      })
    );
    return {
      threadCount: threads.length,
      messageCount: totalMessages,
    };
  },
};
