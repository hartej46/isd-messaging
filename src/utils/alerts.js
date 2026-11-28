import { Alert } from 'react-native';

export function confirmSignOut(onConfirm) {
  Alert.alert('Sign Out', 'Are you sure you want to sign out of Messages?', [
    {
      text: 'Sign Out',
      style: 'destructive',
      onPress: onConfirm,
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
