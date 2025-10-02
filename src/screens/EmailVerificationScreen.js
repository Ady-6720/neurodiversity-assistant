import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Button, Text, Title, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { sendEmailVerification, signOut as firebaseSignOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase.client';

const EmailVerificationScreen = () => {
  const { user, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    // Check verification status immediately on mount
    checkVerificationStatus();
    
    // Then check every 5 seconds (reduced frequency to avoid flickering)
    const interval = setInterval(() => {
      checkVerificationStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.uid]); // Only re-run if user changes

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const checkVerificationStatus = async () => {
    if (!user || checking) return;

    try {
      setChecking(true);
      
      // Reload the user from Firebase to get latest emailVerified status
      await auth.currentUser?.reload();
      const currentUser = auth.currentUser;
      
      if (currentUser?.emailVerified) {
        console.log('✅ Email verified! Proceeding to onboarding...');
        
        // The App.js will automatically detect emailVerified and show onboarding
        // Just trigger a state update by reloading the user object
        // No need to sign out - just let the auth state update naturally
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend || resending) return;

    try {
      setResending(true);
      const currentUser = auth.currentUser;
      
      console.log('Resending verification email...');
      console.log('Current user:', {
        uid: currentUser?.uid,
        email: currentUser?.email,
        emailVerified: currentUser?.emailVerified
      });
      
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        console.log('✅ Verification email resent successfully');
        
        Alert.alert(
          'Email Sent',
          'Verification email has been sent. Please check your inbox and spam folder.',
          [{ text: 'OK' }]
        );
        
        // Start countdown
        setCanResend(false);
        setCountdown(60);
      } else if (currentUser?.emailVerified) {
        Alert.alert(
          'Already Verified',
          'Your email is already verified! The app will proceed shortly.',
          [{ text: 'OK' }]
        );
        checkVerificationStatus();
      } else {
        Alert.alert(
          'Error',
          'No user found. Please sign in again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error resending verification email:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to send verification email. ';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a few minutes and try again.';
      } else if (error.code === 'auth/user-token-expired') {
        errorMessage = 'Session expired. Please sign in again.';
      } else {
        errorMessage += error.message;
      }
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = () => {
    Alert.alert(
      'Change Email',
      'To change your email address, you need to sign out and create a new account with a different email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out & Change',
          style: 'destructive',
          onPress: handleSignOut,
        },
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      await signOut();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleCheckNow = async () => {
    await checkVerificationStatus();
    
    if (!user?.emailVerified) {
      Alert.alert(
        'Not Verified Yet',
        'Please click the verification link in your email. Check your spam folder if you don\'t see it.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <MaterialCommunityIcons name="email-check" size={64} color={colors.primary} />

        {/* Title */}
        <Title style={styles.title}>Verify Your Email</Title>
        
        {/* Email Display */}
        <Text style={styles.email}>{user?.email}</Text>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Check your email (including spam folder) and click the verification link.
        </Text>

        {/* Auto-refresh Indicator */}
        <View style={styles.autoRefreshContainer}>
          <MaterialCommunityIcons 
            name="refresh" 
            size={14} 
            color={checking ? colors.primary : colors.subtext} 
          />
          <Text style={styles.autoRefreshText}>
            {checking ? 'Checking...' : 'Auto-checking every 3s'}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={handleCheckNow}
            style={styles.primaryButton}
            disabled={checking}
          >
            I've Verified My Email
          </Button>

          <Button
            mode="outlined"
            onPress={handleResendEmail}
            style={styles.secondaryButton}
            disabled={!canResend || resending}
            loading={resending}
          >
            {countdown > 0 ? `Resend (${countdown}s)` : 'Resend Email'}
          </Button>

          <View style={styles.bottomButtons}>
            <Button
              mode="text"
              onPress={handleChangeEmail}
              style={styles.textButton}
              compact
            >
              Change Email
            </Button>
            <Button
              mode="text"
              onPress={handleSignOut}
              style={styles.textButton}
              compact
            >
              Sign Out
            </Button>
          </View>
        </View>

        {/* Help Text */}
        <Text style={styles.helpText}>
          💡 Tip: Check your spam folder if you don't see the email
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  email: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  instructions: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  autoRefreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.highlight,
    borderRadius: 16,
  },
  autoRefreshText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  buttonsContainer: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryButton: {
    borderRadius: 8,
  },
  secondaryButton: {
    borderRadius: 8,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.xs,
  },
  textButton: {
    marginTop: 0,
  },
  helpText: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default EmailVerificationScreen;
