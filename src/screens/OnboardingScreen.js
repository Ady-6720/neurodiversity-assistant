// src/screens/OnboardingScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  RadioButton,
  Checkbox,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../config/theme';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const OnboardingScreen = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Quiz data
  const [responses, setResponses] = useState({
    neurodiversityTypes: [],
    primaryChallenges: [],
    supportNeeds: [],
    sensoryPreferences: {},
    communicationStyle: '',
    focusPreferences: {},
    dailyRoutineImportance: '',
    technologyComfort: '',
  });

  const steps = [
    {
      title: 'Welcome to NeuroEase!',
      subtitle: 'Let\'s personalize your experience',
      type: 'welcome'
    },
    {
      title: 'About You',
      subtitle: 'Help us understand your neurodiversity',
      type: 'neurodiversity'
    },
    {
      title: 'Your Challenges',
      subtitle: 'What areas would you like support with?',
      type: 'challenges'
    },
    {
      title: 'Sensory Preferences',
      subtitle: 'How do you respond to different environments?',
      type: 'sensory'
    },
    {
      title: 'Communication Style',
      subtitle: 'How do you prefer to communicate?',
      type: 'communication'
    },
    {
      title: 'Focus & Productivity',
      subtitle: 'What helps you stay focused?',
      type: 'focus'
    },
    {
      title: 'Almost Done!',
      subtitle: 'Just a few more questions',
      type: 'final'
    }
  ];

  const neurodiversityOptions = [
    { label: 'ADHD', value: 'adhd' },
    { label: 'Autism Spectrum', value: 'autism' },
    { label: 'Dyslexia', value: 'dyslexia' },
    { label: 'Dyspraxia', value: 'dyspraxia' },
    { label: 'Anxiety Disorders', value: 'anxiety' },
    { label: 'Depression', value: 'depression' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ];

  const challengeOptions = [
    { label: 'Time management', value: 'time_management' },
    { label: 'Task organization', value: 'task_organization' },
    { label: 'Focus and concentration', value: 'focus' },
    { label: 'Social communication', value: 'social_communication' },
    { label: 'Sensory overload', value: 'sensory_overload' },
    { label: 'Emotional regulation', value: 'emotional_regulation' },
    { label: 'Memory and planning', value: 'memory_planning' },
    { label: 'Routine management', value: 'routine_management' },
  ];

  const handleMultiSelect = (field, value) => {
    setResponses(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSingleSelect = (field, value) => {
    setResponses(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedSelect = (field, subfield, value) => {
    setResponses(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subfield]: value
      }
    }));
  };

  const saveUserProfile = async () => {
    try {
      setLoading(true);
      
      const profileData = {
        id: user.id,
        neurodiversity_type: responses.neurodiversityTypes,
        preferences: {
          primary_challenges: responses.primaryChallenges,
          support_needs: responses.supportNeeds,
          sensory_preferences: responses.sensoryPreferences,
          communication_style: responses.communicationStyle,
          focus_preferences: responses.focusPreferences,
          daily_routine_importance: responses.dailyRoutineImportance,
          technology_comfort: responses.technologyComfort,
          onboarding_completed: true,
          onboarding_date: new Date().toISOString(),
        }
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData);

      if (error) throw error;

      Alert.alert(
        'Welcome to NeuroEase!',
        'Your profile has been set up. Let\'s get started!',
        [{ text: 'Continue', onPress: onComplete }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
      console.error('Profile save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      saveUserProfile();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.type) {
      case 'welcome':
        return (
          <View style={styles.stepContent}>
            <Title style={styles.welcomeTitle}>Welcome to NeuroEase! 🌟</Title>
            <Paragraph style={styles.welcomeText}>
              We're here to support your unique neurodivergent journey. This quick setup will help us personalize your experience.
            </Paragraph>
            <Paragraph style={styles.welcomeSubtext}>
              • All information is private and secure
              • You can change these settings anytime
              • Skip any questions you're not comfortable with
            </Paragraph>
          </View>
        );

      case 'neurodiversity':
        return (
          <View style={styles.stepContent}>
            <Paragraph style={styles.questionText}>
              Which of these apply to you? (Select all that apply)
            </Paragraph>
            {neurodiversityOptions.map((option) => (
              <View key={option.value} style={styles.checkboxRow}>
                <Checkbox
                  status={responses.neurodiversityTypes.includes(option.value) ? 'checked' : 'unchecked'}
                  onPress={() => handleMultiSelect('neurodiversityTypes', option.value)}
                  color={colors.primary}
                />
                <Paragraph style={styles.checkboxLabel}>{option.label}</Paragraph>
              </View>
            ))}
          </View>
        );

      case 'challenges':
        return (
          <View style={styles.stepContent}>
            <Paragraph style={styles.questionText}>
              What areas would you like support with? (Select all that apply)
            </Paragraph>
            {challengeOptions.map((option) => (
              <View key={option.value} style={styles.checkboxRow}>
                <Checkbox
                  status={responses.primaryChallenges.includes(option.value) ? 'checked' : 'unchecked'}
                  onPress={() => handleMultiSelect('primaryChallenges', option.value)}
                  color={colors.primary}
                />
                <Paragraph style={styles.checkboxLabel}>{option.label}</Paragraph>
              </View>
            ))}
          </View>
        );

      case 'sensory':
        return (
          <View style={styles.stepContent}>
            <Paragraph style={styles.questionText}>
              How sensitive are you to different sensory inputs?
            </Paragraph>
            
            {['Sound', 'Light', 'Touch', 'Crowds'].map((sensory) => (
              <View key={sensory} style={styles.sensoryRow}>
                <Paragraph style={styles.sensoryLabel}>{sensory}:</Paragraph>
                <RadioButton.Group
                  onValueChange={(value) => handleNestedSelect('sensoryPreferences', sensory.toLowerCase(), value)}
                  value={responses.sensoryPreferences[sensory.toLowerCase()] || ''}
                >
                  <View style={styles.radioRow}>
                    {['Low', 'Medium', 'High'].map((level) => (
                      <View key={level} style={styles.radioOption}>
                        <RadioButton value={level.toLowerCase()} color={colors.primary} />
                        <Paragraph style={styles.radioLabel}>{level}</Paragraph>
                      </View>
                    ))}
                  </View>
                </RadioButton.Group>
              </View>
            ))}
          </View>
        );

      case 'communication':
        return (
          <View style={styles.stepContent}>
            <Paragraph style={styles.questionText}>
              How do you prefer to communicate?
            </Paragraph>
            <RadioButton.Group
              onValueChange={(value) => handleSingleSelect('communicationStyle', value)}
              value={responses.communicationStyle}
            >
              {[
                { label: 'Direct and clear', value: 'direct' },
                { label: 'Gentle and supportive', value: 'gentle' },
                { label: 'Visual aids and examples', value: 'visual' },
                { label: 'Step-by-step instructions', value: 'structured' },
              ].map((option) => (
                <View key={option.value} style={styles.radioFullRow}>
                  <RadioButton value={option.value} color={colors.primary} />
                  <Paragraph style={styles.radioLabel}>{option.label}</Paragraph>
                </View>
              ))}
            </RadioButton.Group>
          </View>
        );

      case 'focus':
        return (
          <View style={styles.stepContent}>
            <Paragraph style={styles.questionText}>
              What helps you focus best?
            </Paragraph>
            
            <View style={styles.focusSection}>
              <Paragraph style={styles.subQuestionText}>Preferred work duration:</Paragraph>
              <RadioButton.Group
                onValueChange={(value) => handleNestedSelect('focusPreferences', 'work_duration', value)}
                value={responses.focusPreferences.work_duration || ''}
              >
                {[
                  { label: '15-25 minutes (Pomodoro)', value: 'pomodoro' },
                  { label: '45-60 minutes (Deep work)', value: 'deep_work' },
                  { label: 'Flexible timing', value: 'flexible' },
                ].map((option) => (
                  <View key={option.value} style={styles.radioFullRow}>
                    <RadioButton value={option.value} color={colors.primary} />
                    <Paragraph style={styles.radioLabel}>{option.label}</Paragraph>
                  </View>
                ))}
              </RadioButton.Group>
            </View>
          </View>
        );

      case 'final':
        return (
          <View style={styles.stepContent}>
            <Paragraph style={styles.questionText}>
              How important are daily routines to you?
            </Paragraph>
            <RadioButton.Group
              onValueChange={(value) => handleSingleSelect('dailyRoutineImportance', value)}
              value={responses.dailyRoutineImportance}
            >
              {[
                { label: 'Very important - I need structure', value: 'very_important' },
                { label: 'Somewhat important - I like some routine', value: 'somewhat_important' },
                { label: 'Not very important - I prefer flexibility', value: 'not_important' },
              ].map((option) => (
                <View key={option.value} style={styles.radioFullRow}>
                  <RadioButton value={option.value} color={colors.primary} />
                  <Paragraph style={styles.radioLabel}>{option.label}</Paragraph>
                </View>
              ))}
            </RadioButton.Group>

            <Divider style={styles.divider} />

            <Paragraph style={styles.questionText}>
              How comfortable are you with technology?
            </Paragraph>
            <RadioButton.Group
              onValueChange={(value) => handleSingleSelect('technologyComfort', value)}
              value={responses.technologyComfort}
            >
              {[
                { label: 'Very comfortable', value: 'high' },
                { label: 'Somewhat comfortable', value: 'medium' },
                { label: 'Need simple interfaces', value: 'low' },
              ].map((option) => (
                <View key={option.value} style={styles.radioFullRow}>
                  <RadioButton value={option.value} color={colors.primary} />
                  <Paragraph style={styles.radioLabel}>{option.label}</Paragraph>
                </View>
              ))}
            </RadioButton.Group>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProgressBar 
          progress={(currentStep + 1) / steps.length} 
          color={colors.primary}
          style={styles.progressBar}
        />
        <Title style={styles.stepTitle}>{steps[currentStep].title}</Title>
        <Paragraph style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Paragraph>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            {renderStepContent()}
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <Button
              mode="outlined"
              onPress={prevStep}
              style={styles.backButton}
              textColor={colors.primary}
            >
              Back
            </Button>
          )}
          <Button
            mode="contained"
            onPress={nextStep}
            loading={loading}
            disabled={loading}
            style={styles.nextButton}
            buttonColor={colors.primary}
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent3,
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.subtext,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    elevation: 2,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  stepContent: {
    paddingVertical: spacing.md,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  subQuestionText: {
    fontSize: 14,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkboxLabel: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  radioFullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.text,
  },
  sensoryRow: {
    marginBottom: spacing.lg,
  },
  sensoryLabel: {
    fontSize: 14,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  focusSection: {
    marginBottom: spacing.lg,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
    borderColor: colors.primary,
  },
  nextButton: {
    flex: 2,
  },
});

export default OnboardingScreen;
