import { AVATAR_COLORS } from '@/services/mockData';

export function formatShortTime(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function pickAvatarColor(name = '') {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) {
    sum += name.charCodeAt(i);
  }
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function formatNameFromEmail(email) {
  const localPart = (email || '').split('@')[0] || 'User';
  const parts = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());

  const name = parts.length > 0 ? parts.join(' ') : 'Galaxy User';
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0] ? parts[0].substring(0, 2) : 'GU').toUpperCase();

  return { name, initials };
}

export function sortThreads(list) {
  return [...list].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });
}
