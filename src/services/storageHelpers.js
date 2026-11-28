import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  AUTH_SESSION: '@app_auth_session',
  THREADS: '@messages_threads',
  THREAD_MESSAGES_PREFIX: '@messages_thread_',
  API_DIRECTORY: '@app_api_directory',
  SETTINGS: '@app_user_settings',
  SEEDED: '@app_seeded_v1',
};

export const DEFAULT_SETTINGS = {
  theme: 'system',
  autoReply: true,
  notifications: true,
};

export async function readJson(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Failed to read key ${key}:`, error);
    return fallback;
  }
}

export async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key) {
  await AsyncStorage.removeItem(key);
}
