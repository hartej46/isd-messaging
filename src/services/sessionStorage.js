import {
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  readJson,
  removeKey,
  writeJson,
} from './storageHelpers';

export const sessionStorage = {
  getSession() {
    return readJson(STORAGE_KEYS.AUTH_SESSION, null);
  },

  setSession(session) {
    return writeJson(STORAGE_KEYS.AUTH_SESSION, session);
  },

  clearSession() {
    return removeKey(STORAGE_KEYS.AUTH_SESSION);
  },

  async getSettings() {
    const saved = await readJson(STORAGE_KEYS.SETTINGS, null);
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
  },

  async saveSettings(settings) {
    const current = await this.getSettings();
    const merged = { ...current, ...settings };
    await writeJson(STORAGE_KEYS.SETTINGS, merged);
    return merged;
  },
};
