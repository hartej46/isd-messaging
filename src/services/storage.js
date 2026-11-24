import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_MESSAGES, INITIAL_THREADS } from './mockData';

const KEYS = {
  AUTH_SESSION: '@app_auth_session',
  THREADS: '@messages_threads',
  THREAD_MESSAGES_PREFIX: '@messages_thread_',
  SETTINGS: '@app_user_settings',
  SEEDED: '@app_seeded_v1',
};

const DEFAULT_SETTINGS = {
  theme: 'system',
  autoReply: true,
  notifications: true,
};

export const storageService = {
  // Session Methods
  async getSession() {
    try {
      const data = await AsyncStorage.getItem(KEYS.AUTH_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get auth session from AsyncStorage:', error);
      return null;
    }
  },

  async setSession(session) {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save auth session to AsyncStorage:', error);
      throw error;
    }
  },

  async clearSession() {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH_SESSION);
    } catch (error) {
      console.error('Failed to clear auth session from AsyncStorage:', error);
      throw error;
    }
  },

  // Threads Methods
  async getThreads() {
    try {
      const data = await AsyncStorage.getItem(KEYS.THREADS);
      if (!data) {
        await this.seedInitialData();
        const seeded = await AsyncStorage.getItem(KEYS.THREADS);
        return seeded ? JSON.parse(seeded) : [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to get threads from AsyncStorage:', error);
      return [];
    }
  },

  async saveThreads(threads) {
    try {
      await AsyncStorage.setItem(KEYS.THREADS, JSON.stringify(threads));
    } catch (error) {
      console.error('Failed to save threads to AsyncStorage:', error);
      throw error;
    }
  },

  async upsertThread(thread) {
    try {
      const threads = await this.getThreads();
      const existingIndex = threads.findIndex((t) => t.id === thread.id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...threads];
        updated[existingIndex] = thread;
      } else {
        updated = [thread, ...threads];
      }
      await this.saveThreads(updated);
      return updated;
    } catch (error) {
      console.error('Failed to upsert thread in AsyncStorage:', error);
      throw error;
    }
  },

  async deleteThread(threadId) {
    try {
      const threads = await this.getThreads();
      const filtered = threads.filter((t) => t.id !== threadId);
      await this.saveThreads(filtered);
      await AsyncStorage.removeItem(`${KEYS.THREAD_MESSAGES_PREFIX}${threadId}`);
      return filtered;
    } catch (error) {
      console.error(`Failed to delete thread ${threadId}:`, error);
      throw error;
    }
  },

  async togglePin(threadId) {
    try {
      const threads = await this.getThreads();
      const updated = threads.map((t) =>
        t.id === threadId ? { ...t, isPinned: !t.isPinned } : t
      );
      await this.saveThreads(updated);
      return updated;
    } catch (error) {
      console.error(`Failed to toggle pin for thread ${threadId}:`, error);
      throw error;
    }
  },

  async toggleRead(threadId) {
    try {
      const threads = await this.getThreads();
      const updated = threads.map((t) =>
        t.id === threadId
          ? { ...t, unreadCount: t.unreadCount > 0 ? 0 : 1 }
          : t
      );
      await this.saveThreads(updated);
      return updated;
    } catch (error) {
      console.error(`Failed to toggle read for thread ${threadId}:`, error);
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      const threads = await this.getThreads();
      const updated = threads.map((t) => ({ ...t, unreadCount: 0 }));
      await this.saveThreads(updated);
      return updated;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  },

  // Messages Methods
  async getMessages(threadId) {
    try {
      const key = `${KEYS.THREAD_MESSAGES_PREFIX}${threadId}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) {
        const initial = INITIAL_MESSAGES[threadId] || [];
        if (initial.length > 0) {
          await AsyncStorage.setItem(key, JSON.stringify(initial));
        }
        return initial;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to get messages for thread ${threadId}:`, error);
      return [];
    }
  },

  async saveMessage(threadId, message) {
    try {
      const key = `${KEYS.THREAD_MESSAGES_PREFIX}${threadId}`;
      const current = await this.getMessages(threadId);
      const updated = [...current, message];
      await AsyncStorage.setItem(key, JSON.stringify(updated));

      // Also update thread's lastMessage and timestamp
      const threads = await this.getThreads();
      const threadIndex = threads.findIndex((t) => t.id === threadId);
      if (threadIndex >= 0) {
        threads[threadIndex].lastMessage = message.text;
        threads[threadIndex].timestamp = message.timestamp;
        await this.saveThreads(threads);
      }

      return updated;
    } catch (error) {
      console.error(`Failed to save message in thread ${threadId}:`, error);
      throw error;
    }
  },

  // Settings
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to get settings from AsyncStorage:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings) {
    try {
      const current = await this.getSettings();
      const merged = { ...current, ...settings };
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged));
      return merged;
    } catch (error) {
      console.error('Failed to save settings to AsyncStorage:', error);
      throw error;
    }
  },

  // Initial Data Seeding
  async seedInitialData(force = false) {
    try {
      const isSeeded = await AsyncStorage.getItem(KEYS.SEEDED);
      if (!isSeeded || force) {
        await AsyncStorage.setItem(KEYS.THREADS, JSON.stringify(INITIAL_THREADS));
        for (const [threadId, msgs] of Object.entries(INITIAL_MESSAGES)) {
          await AsyncStorage.setItem(
            `${KEYS.THREAD_MESSAGES_PREFIX}${threadId}`,
            JSON.stringify(msgs)
          );
        }
        await AsyncStorage.setItem(KEYS.SEEDED, 'true');
      }
    } catch (error) {
      console.error('Failed to seed initial data:', error);
    }
  },

  async resetAllData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((k) => k.startsWith('@app_') || k.startsWith('@messages_'));
      await AsyncStorage.multiRemove(appKeys);
      await this.seedInitialData(true);
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    }
  },
};
