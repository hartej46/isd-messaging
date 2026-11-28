import { Platform } from 'react-native';
import {
  Contact,
  ContactField,
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-contacts';

import { pickAvatarColor } from '@/utils/formatters';

function normalizePhone(phones) {
  if (!Array.isArray(phones) || phones.length === 0) return '';
  const firstValid = phones.find((p) => p && typeof p.number === 'string' && p.number.trim());
  return firstValid ? firstValid.number.trim() : '';
}

export async function getDeviceContactsPermission() {
  if (Platform.OS === 'web') {
    return { supported: false, status: 'unavailable' };
  }
  const res = await getPermissionsAsync();
  return { supported: true, status: res.status };
}

export async function fetchDeviceContacts() {
  if (Platform.OS === 'web') {
    return { supported: false, status: 'unavailable', contacts: [] };
  }

  const permission = await requestPermissionsAsync();
  if (permission.status !== 'granted') {
    return { supported: true, status: permission.status, contacts: [] };
  }

  const details = await Contact.getAllDetails(
    [ContactField.FULL_NAME, ContactField.PHONES, ContactField.IMAGE],
    { limit: 250 }
  );

  const seen = new Set();
  const mapped = [];

  for (const item of details) {
    const contactName = (item.fullName || '').trim();
    const phoneNumber = normalizePhone(item.phones);
    if (!contactName && !phoneNumber) continue;

    const displayName = contactName || phoneNumber;
    const dedupeKey = `${displayName.toLowerCase()}::${phoneNumber}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    mapped.push({
      id: `device_${item.id}`,
      contactName: displayName,
      phoneNumber: phoneNumber || 'No phone number',
      avatarColor: pickAvatarColor(displayName),
      avatarUrl: item.image?.uri || null,
      category: 'personal',
      isDeviceContact: true,
    });
  }

  mapped.sort((a, b) => a.contactName.localeCompare(b.contactName));

  return {
    supported: true,
    status: 'granted',
    contacts: mapped,
  };
}
