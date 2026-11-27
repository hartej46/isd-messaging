import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { storageService } from '@/services/storage';

const SettingsContext = createContext(undefined);

const DEFAULT_SETTINGS = {
  theme: 'system',
  autoReply: true,
  notifications: true,
};

export function SettingsProvider({ children }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    storageService
      .getSettings()
      .then((loaded) => {
        if (isMounted) {
          setSettings(loaded);
          setIsLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        if (isMounted) setIsLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSettings = async (partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    try {
      const saved = await storageService.saveSettings(partial);
      setSettings(saved);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const resolvedColorScheme =
    settings.theme === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : settings.theme;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoaded,
        resolvedColorScheme,
        updateSettings,
      }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
