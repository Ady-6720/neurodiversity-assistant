// src/screens/SimpleAuthScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography } from '../config/theme';
import LandingScreen from './LandingScreen';

const SimpleAuthScreen = ({ showLanding = true }) => {
  const [showLandingPage, setShowLandingPage] = useState(showLanding);
  const [authStep, setAuthStep] = useState('email'); // 'email', 'password', 'verify'
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  // Show landing page first
  if (showLandingPage) {
    return (
      <LandingScreen 
        onGetStarted={() => setShowLandingPage(false)}
      />
    );
  }

  const handleEmailSubmit = () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    setAuthStep('password');
  };

  const handleAuth = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, { displayName: email.split('@')[0] });
        if (!result.error) {
          setAuthStep('verify');
          setLoading(false);
          return;
        }
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        if (result.error.message.includes('Email not confirmed')) {
          Alert.alert(
            'Email Not Verified',
            'Please check your email and click the verification link before signing in.',
            [
              { text: 'Resend Email', onPress: () => resendVerification() },
              { text: 'OK' }
            ]
          );
        } else if (result.error.message.includes('Invalid login credentials')) {
          Alert.alert(
            'Account Not Found',
            'No account found with this email. Would you like to create one?',
            [
              { text: 'Sign Up', onPress: () => setIsSignUp(true) },
              { text: 'Try Again' }
            ]
          );
        } else {
          Alert.alert('Authentication Error', result.error.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      const result = await signUp(email, password);
      if (!result.error) {
        Alert.alert('Verification Email Sent', 'Please check your email for the verification link.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification email.');
    }
  };

  const goBack = () => {
    if (authStep === 'password') {
      setAuthStep('email');
    } else if (authStep === 'verify') {
      setAuthStep('password');
    }
  };

  const renderEmailStep = () => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="email-outline" 
            size={48} 
            color={colors.primary} 
          />
        </View>
        
        <Title style={styles.title}>Welcome to NeuroEase</Title>
        <Paragraph style={styles.subtitle}>
          Enter your email to get started
        </Paragraph>

        <TextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: colors.primary } }}
          autoFocus
        />

        <Button
          mode="contained"
          onPress={handleEmailSubmit}
          style={styles.button}
          buttonColor={colors.primary}
          contentStyle={styles.buttonContent}
        >
          Continue
        </Button>

        <Paragraph style={styles.footerText}>
          We'll check if you have an account or help you create one
        </Paragraph>
      </Card.Content>
    </Card>
  );

  const renderPasswordStep = () => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={isSignUp ? "account-plus" : "lock-outline"} 
            size={48} 
            color={colors.primary} 
          />
        </View>
        
        <Title style={styles.title}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Title>
        <Paragraph style={styles.subtitle}>
          {email}
        </Paragraph>

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: colors.primary } }}
          autoFocus
        />

        {isSignUp && (
          <Paragraph style={styles.passwordHint}>
            Password must be at least 6 characters
          </Paragraph>
        )}

        <Button
          mode="contained"
          onPress={handleAuth}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor={colors.primary}
          contentStyle={styles.buttonContent}
        >
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Button>

        <Divider style={styles.divider} />

        <Button
          mode="text"
          onPress={() => setIsSignUp(!isSignUp)}
          textColor={colors.primary}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </Button>

        <Button
          mode="text"
          onPress={goBack}
          textColor={colors.subtext}
          style={styles.backButton}
        >
          ← Change Email
        </Button>
      </Card.Content>
    </Card>
  );

  const renderVerifyStep = () => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="email-check" 
            size={48} 
            color={colors.success} 
          />
        </View>
        
        <Title style={styles.title}>Check Your Email</Title>
        <Paragraph style={styles.subtitle}>
          We sent a verification link to:
        </Paragraph>
        <Paragraph style={styles.emailText}>
          {email}
        </Paragraph>

        <Paragraph style={styles.instructionText}>
          Click the link in your email to verify your account, then come back here to sign in.
        </Paragraph>

        <Button
          mode="contained"
          onPress={() => {
            setAuthStep('password');
            setIsSignUp(false);
          }}
          style={styles.button}
          buttonColor={colors.primary}
          contentStyle={styles.buttonContent}
        >
          I've Verified - Sign In
        </Button>

        <Button
          mode="text"
          onPress={resendVerification}
          textColor={colors.primary}
          style={styles.resendButton}
        >
          Resend Verification Email
        </Button>

        <Button
          mode="text"
          onPress={goBack}
          textColor={colors.subtext}
          style={styles.backButton}
        >
          ← Go Back
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {authStep === 'email' && renderEmailStep()}
          {authStep === 'password' && renderPasswordStep()}
          {authStep === 'verify' && renderVerifyStep()}
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    elevation: 4,
    borderRadius: 16,
  },
  cardContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emailText: {
    fontSize: 16,
    fontWeight: typography.weights.medium,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  instructionText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  input: {
    width: '100%',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  passwordHint: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    width: '100%',
    marginBottom: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  divider: {
    width: '100%',
    marginVertical: spacing.lg,
  },
  backButton: {
    marginTop: spacing.sm,
  },
  resendButton: {
    marginBottom: spacing.sm,
  },
  footerText: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default SimpleAuthScreen;
