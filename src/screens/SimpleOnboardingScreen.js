// src/screens/SimpleOnboardingScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const SimpleOnboardingScreen = ({ onComplete }) => {
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    primaryChallenges: [],
  });

  const steps = [
    {
      title: 'Welcome to NeuroEase',
      subtitle: 'Let\'s personalize your experience',
    },
  ];



  const challengeOptions = [
    'Time management',
    'Staying focused',
    'Organization',
    'Social situations',
    'Sensory sensitivity',
    'Memory issues',
    'Planning ahead',
    'Emotional regulation',
  ];



  const toggleChallenge = (challenge) => {
    setFormData(prev => ({
      ...prev,
      primaryChallenges: prev.primaryChallenges.includes(challenge)
        ? prev.primaryChallenges.filter(c => c !== challenge)
        : [...prev.primaryChallenges, challenge]
    }));
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      
      const profileData = {
        id: user.uid,
        display_name: user.email?.split('@')[0] || 'User',
        email: user.email,
        preferences: {
          primary_challenges: formData.primaryChallenges,
          onboarding_completed: true,
          onboarding_date: new Date().toISOString(),
        },
        updated_at: new Date().toISOString()
      };

      const profileRef = doc(db, 'user_profiles', user.uid);
      await setDoc(profileRef, profileData, { merge: true });

      // Call completeOnboarding to update the auth state
      console.log('Calling completeOnboarding...');
      await completeOnboarding();
      console.log('Onboarding completed successfully');
      
      // Add a small delay to ensure state updates properly
      setTimeout(() => {
        Alert.alert(
          'Welcome to NeuroEase!',
          'Your profile has been set up successfully!',
          [{ text: 'Get Started', onPress: onComplete }]
        );
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
      console.error('Profile save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    saveProfile();
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    return formData.primaryChallenges.length > 0;
  };

  const renderStep = () => {
    return (
      <View style={styles.stepContent}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>What are your main challenges? (Select all that apply) *</Text>
          {challengeOptions.map((challenge, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                formData.primaryChallenges.includes(challenge) && styles.optionButtonSelected
              ]}
              onPress={() => toggleChallenge(challenge)}
            >
              <Text style={[
                styles.optionText,
                formData.primaryChallenges.includes(challenge) && styles.optionTextSelected
              ]}>
                {challenge}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
        <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
      </View>

      <View style={styles.form}>
        {renderStep()}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled,
            styles.nextButtonFull
          ]}
          onPress={nextStep}
          disabled={!canProceed() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.nextButtonText}>
              Complete Setup
            </Text>
          )}
        </TouchableOpacity>
        
        {/* Debug button - remove in production */}
        <TouchableOpacity 
          style={[styles.debugButton]} 
          onPress={async () => {
            console.log('Debug: Manually completing onboarding');
            await completeOnboarding();
          }}
        >
          <Text style={styles.debugButtonText}>Debug: Skip Onboarding</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  stepContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    minHeight: 100,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF4FF',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
  },

  nextButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },

  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  debugButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default SimpleOnboardingScreen;
