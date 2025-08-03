// src/screens/AuthScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Switch,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography } from '../config/theme';
import LandingScreen from './LandingScreen';

const AuthScreen = ({ showLanding = true }) => {
  const [showLandingPage, setShowLandingPage] = useState(showLanding);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, { displayName });
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        Alert.alert('Authentication Error', result.error.message);
      } else if (isSignUp) {
        Alert.alert(
          'Success',
          'Account created! Please check your email to verify your account.'
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Show landing page first
  if (showLandingPage) {
    return (
      <LandingScreen 
        onGetStarted={() => setShowLandingPage(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Title style={styles.title}>NeuroEase</Title>
            <Paragraph style={styles.subtitle}>
              Your neurodiversity assistant
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Title>

              {isSignUp && (
                <TextInput
                  label="Display Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  style={styles.input}
                  mode="outlined"
                  theme={{ colors: { primary: colors.primary } }}
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
                theme={{ colors: { primary: colors.primary } }}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
                theme={{ colors: { primary: colors.primary } }}
              />

              {isSignUp && (
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                  mode="outlined"
                  theme={{ colors: { primary: colors.primary } }}
                />
              )}

              <Button
                mode="contained"
                onPress={handleAuth}
                loading={loading}
                disabled={loading}
                style={styles.authButton}
                buttonColor={colors.primary}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>

              <Divider style={styles.divider} />

              <View style={styles.switchContainer}>
                <Paragraph>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Paragraph>
                <Switch
                  value={isSignUp}
                  onValueChange={setIsSignUp}
                  color={colors.primary}
                />
                <Paragraph>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Paragraph style={styles.footerText}>
              Designed with neurodiversity in mind
            </Paragraph>
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
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtext,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    elevation: 4,
    borderRadius: 12,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.text,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  authButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.subtext,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AuthScreen;
