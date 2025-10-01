// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
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
      }
      setUser(currentUser);
      
      // Load profile if user exists
      if (currentUser) {
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const newProfile = {
        id: userCredential.user.uid,
        display_name: userData.displayName || email.split('@')[0],
        email: email,
        neurodiversity_type: [],
        preferences: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'user_profiles', userCredential.user.uid), newProfile);
      
      return { data: userCredential, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
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

  const value = {
    user,
    profile,
    loading,
    needsOnboarding,
    signIn,
    signUp,
    signOut,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
