import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Text,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../config/theme';
import LandingScreen from './LandingScreen';

const AuthScreen = ({ showLanding = true }) => {
  const [showLandingPage, setShowLandingPage] = useState(showLanding);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(email, password, { displayName });
        if (result.error) {
          Alert.alert('Signup failed', result.error.message);
        } else {
          setShowEmailVerification(true);
          Alert.alert(
            'Check your email',
            'We sent you a verification link. Please verify your email before signing in.',
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          );
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          if (result.error.code === 'auth/user-not-found') {
            Alert.alert('No account found', 'Please sign up first');
          } else if (result.error.code === 'auth/wrong-password') {
            Alert.alert('Wrong password', 'Please try again');
          } else {
            Alert.alert('Sign in failed', result.error.message);
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Alert.alert('Coming soon', 'Google sign-in will be available soon');
  };

  const handleAppleSignIn = async () => {
    Alert.alert('Coming soon', 'Apple sign-in will be available soon');
  };

  const handlePhoneSignIn = async () => {
    Alert.alert('Coming soon', 'Phone sign-in will be available soon');
  };

  const handleAnonymousSignIn = async () => {
    Alert.alert('Coming soon', 'Anonymous sign-in will be available soon');
  };

  if (showLandingPage) {
    return <LandingScreen onGetStarted={() => setShowLandingPage(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Title style={styles.title}>NeuroEase</Title>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </Text>
          </View>

          {/* Main Card */}
          <Card style={styles.card}>
            <Card.Content>
              {/* Email/Password Form */}
              {isSignUp && (
                <TextInput
                  label="Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="account" />}
                />
              )}

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="lock" />}
              />

              {isSignUp && (
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="lock-check" />}
                />
              )}

              <Button
                mode="contained"
                onPress={handleEmailAuth}
                loading={loading}
                disabled={loading}
                style={styles.primaryButton}
                icon="email"
              >
                {isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
              </Button>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <Divider style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <Divider style={styles.dividerLine} />
              </View>

              {/* Social Sign In Buttons */}
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleSignIn}
                >
                  <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleAppleSignIn}
                >
                  <MaterialCommunityIcons name="apple" size={24} color="#000000" />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handlePhoneSignIn}
                >
                  <MaterialCommunityIcons name="phone" size={24} color={colors.primary} />
                  <Text style={styles.socialButtonText}>Phone</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleAnonymousSignIn}
                >
                  <MaterialCommunityIcons name="incognito" size={24} color="#6B7280" />
                  <Text style={styles.socialButtonText}>Guest</Text>
                </TouchableOpacity>
              </View>

              {/* Toggle Sign In/Sign Up */}
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsSignUp(!isSignUp)}
              >
                <Text style={styles.toggleText}>
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made for people who think differently 💙
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtext,
  },
  card: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 13,
    color: colors.subtext,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: spacing.xs,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toggleButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.subtext,
    fontSize: 14,
  },
});

export default AuthScreen;
