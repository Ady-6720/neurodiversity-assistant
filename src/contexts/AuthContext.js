// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase.client';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Add id property for compatibility with existing code
      if (currentUser) {
        currentUser.id = currentUser.uid;
        console.log('Auth state changed:', {
          email: currentUser.email,
          emailVerified: currentUser.emailVerified,
          uid: currentUser.uid
        });
      }
      setUser(currentUser);
      
      // Load profile if user exists AND email is verified
      if (currentUser && currentUser.emailVerified) {
        try {
          const profileRef = doc(db, 'user_profiles', currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            setProfile(profileData);
            // Check if onboarding is completed
            const onboardingCompleted = profileData.preferences?.onboarding_completed || false;
            console.log('Profile loaded:', profileData);
            console.log('Onboarding completed:', onboardingCompleted);
            setNeedsOnboarding(!onboardingCompleted);
          } else {
            // New user - create profile and needs onboarding
            const newProfile = {
              id: currentUser.uid,
              display_name: currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email,
              neurodiversity_type: [],
              preferences: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            await setDoc(profileRef, newProfile);
            setProfile(newProfile);
            setNeedsOnboarding(true);
          }
          setError(null);
        } catch (error) {
          console.error('Error loading user profile:', error);
          setError('Failed to load user profile. Please check your connection.');
          setProfile({ 
            display_name: currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email 
          });
          setNeedsOnboarding(true);
        }
      } else {
        setProfile(null);
        setNeedsOnboarding(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      console.log('Creating user account for:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User account created successfully:', userCredential.user.uid);
      
      // Send email verification
      try {
        console.log('Attempting to send verification email...');
        console.log('User object:', {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified
        });
        
        await sendEmailVerification(userCredential.user);
        console.log('✅ Verification email sent successfully to:', email);
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
        console.error('Email error code:', emailError.code);
        console.error('Email error message:', emailError.message);
        console.error('Full error:', JSON.stringify(emailError, null, 2));
        // Don't fail signup if email sending fails
      }
      
      // Create user profile in Firestore (but user can't access until verified)
      const newProfile = {
        id: userCredential.user.uid,
        display_name: userData.displayName || email.split('@')[0],
        email: email,
        neurodiversity_type: [],
        preferences: {},
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Creating user profile in Firestore...');
      await setDoc(doc(db, 'user_profiles', userCredential.user.uid), newProfile);
      console.log('✅ User profile created successfully');
      
      return { data: userCredential, error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { data: userCredential, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      return { success: true, error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Update the profile in the database to mark onboarding as completed
      if (user) {
        const profileRef = doc(db, 'user_profiles', user.uid);
        const updatedPreferences = {
          ...profile?.preferences,
          onboarding_completed: true,
          onboarding_date: new Date().toISOString(),
        };
        
        await updateDoc(profileRef, {
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        });

        // Update local profile state
        const updatedProfile = {
          ...profile,
          preferences: updatedPreferences
        };
        setProfile(updatedProfile);
        console.log('Profile updated after onboarding completion:', updatedProfile);
      }
      
      // Always set needsOnboarding to false to prevent getting stuck
      setNeedsOnboarding(false);
      console.log('Onboarding marked as completed');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still set needsOnboarding to false to prevent getting stuck
      setNeedsOnboarding(false);
    }
  };

  const signInAsGuest = async () => {
    try {
      setLoading(true);
      const userCredential = await signInAnonymously(auth);
      return { data: userCredential, error: null };
    } catch (error) {
      console.error('Anonymous sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    needsOnboarding,
    signIn,
    signUp,
    signInAsGuest,
    signOut,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
