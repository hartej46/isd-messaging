import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/context/SettingsContext';

export function useTheme() {
  const systemScheme = useColorScheme();
  const settingsContext = useSettings();
  const scheme = settingsContext
    ? settingsContext.resolvedColorScheme
    : systemScheme === 'dark'
      ? 'dark'
      : 'light';

  return Colors[scheme];
}
