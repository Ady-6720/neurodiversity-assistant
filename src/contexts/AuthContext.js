// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

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
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setError(null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to get initial session:', error);
        setError('Failed to connect to authentication service. Please check your internet connection.');
        setIsOnline(false);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Load profile if user exists
      if (currentUser) {
        try {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
            // Check if onboarding is completed
            const onboardingCompleted = profileData.preferences?.onboarding_completed || false;
            console.log('Profile loaded:', profileData);
            console.log('Onboarding completed:', onboardingCompleted);
            setNeedsOnboarding(!onboardingCompleted);
          } else {
            // New user - needs onboarding
            setProfile({ display_name: currentUser.email?.split('@')[0] });
            setNeedsOnboarding(true);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Check if it's a network error or new user
          if (error.message?.includes('PGRST116') || error.code === 'PGRST116') {
            // New user - profile doesn't exist yet
            setProfile({ display_name: currentUser.email?.split('@')[0] });
            setNeedsOnboarding(true);
          } else {
            // Network or other error
            setError('Failed to load user profile. Please check your connection.');
            setProfile({ display_name: currentUser.email?.split('@')[0] });
            setNeedsOnboarding(true);
          }
        }
      } else {
        setProfile(null);
        setNeedsOnboarding(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: userData.displayName || email.split('@')[0],
            ...userData
          }
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Update the profile in the database to mark onboarding as completed
      if (user) {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            preferences: {
              ...profile?.preferences,
              onboarding_completed: true,
              onboarding_date: new Date().toISOString(),
            }
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating onboarding status:', error);
        } else {
          // Update local profile state
          const updatedProfile = {
            ...profile,
            preferences: {
              ...profile?.preferences,
              onboarding_completed: true,
              onboarding_date: new Date().toISOString(),
            }
          };
          setProfile(updatedProfile);
          console.log('Profile updated after onboarding completion:', updatedProfile);
        }
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
