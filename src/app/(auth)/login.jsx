import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (overrideEmail, overridePassword) => {
    const targetEmail = overrideEmail !== undefined ? overrideEmail : email;
    const targetPass = overridePassword !== undefined ? overridePassword : password;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(targetEmail, targetPass);
      if (result.success) {
        router.replace('/');
      } else {
        setErrorMessage(result.error || 'Failed to sign in.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    handleLogin(demoEmail, 'password123');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.headerSection}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.primaryLight },
              ]}>
              <Ionicons name="chatbubble-ellipses" size={42} color={theme.primary} />
            </View>
            <Text style={[styles.mainTitle, { color: theme.text }]}>Messages</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign in with your account or email to sync and manage your messages.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {errorMessage ? (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: `${theme.danger}15`, borderColor: `${theme.danger}40` },
                ]}>
                <Ionicons name="alert-circle-outline" size={18} color={theme.danger} />
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Email or phone
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                  },
                ]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.textTertiary}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.textTertiary}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
                {email.length > 0 && (
                  <Pressable onPress={() => setEmail('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
                  </Pressable>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                  },
                ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.textTertiary}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="Enter any password"
                  placeholderTextColor={theme.textTertiary}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: theme.primary,
                  opacity: isSubmitting ? 0.7 : pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}
              disabled={isSubmitting}
              onPress={() => handleLogin()}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </Pressable>

            <View style={styles.quickAccessSection}>
              <Text style={[styles.quickAccessTitle, { color: theme.textTertiary }]}>
                QUICK SIGN IN (ONE-CLICK)
              </Text>
              <View style={styles.chipsRow}>
                <Pressable
                  style={[
                    styles.chip,
                    { backgroundColor: theme.cardSubtle, borderColor: theme.border },
                  ]}
                  onPress={() => handleQuickFill('hartej@galaxy.com')}>
                  <Text style={[styles.chipText, { color: theme.text }]}>Hartej</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.chip,
                    { backgroundColor: theme.cardSubtle, borderColor: theme.border },
                  ]}
                  onPress={() => handleQuickFill('alex.rivera@galaxy.com')}>
                  <Text style={[styles.chipText, { color: theme.text }]}>Alex Rivera</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.chip,
                    { backgroundColor: theme.cardSubtle, borderColor: theme.border },
                  ]}
                  onPress={() => handleQuickFill('demo.user@galaxy.com')}>
                  <Text style={[styles.chipText, { color: theme.text }]}>Demo Account</Text>
                </Pressable>
              </View>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.cardSubtle, borderColor: theme.border },
              ]}>
              <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
              <Text style={[styles.infoCardText, { color: theme.textSecondary }]}>
                Client-side storage mode: Any email and password will create a persistent local profile stored securely in AsyncStorage.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.five,
    paddingTop: Spacing.three,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.squircle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.three,
  },
  formContainer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: Spacing.one,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.card,
    paddingHorizontal: Spacing.three,
    height: 54,
  },
  fieldIcon: {
    marginRight: Spacing.two,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  submitButton: {
    height: 52,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    shadowColor: '#2A9BA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  quickAccessSection: {
    marginTop: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
  },
  quickAccessTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    marginTop: Spacing.two,
  },
  infoCardText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
