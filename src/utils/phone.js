import { Alert, Linking } from 'react-native';

export async function dialPhoneNumber(phoneNumber, contactName) {
  const cleaned = (phoneNumber || '').replace(/[^\d+*#]/g, '');
  if (!cleaned || cleaned.length < 3) {
    Alert.alert(
      'No Phone Number',
      `No valid phone number is saved for ${contactName || 'this contact'}.`
    );
    return;
  }

  const url = `tel:${cleaned}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(
        'Dialer Unavailable',
        `Cannot open the phone dialer for ${phoneNumber} on this device.`
      );
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      'Call Failed',
      `Unable to open phone dialer for ${phoneNumber}.`
    );
  }
}
