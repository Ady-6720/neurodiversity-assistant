import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Title, Chip, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase.client';

const OnboardingPreferencesScreen = ({ navigation, route }) => {
  const { user, profileData } = route.params || {};
  const { updateUserProfile } = useAuth();
  
  const [neurodiversityTypes, setNeurodiversityTypes] = useState([]);
  const [notifications, setNotifications] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [loading, setLoading] = useState(false);

  const neurodiversityOptions = [
    { id: 'adhd', label: 'ADHD', icon: 'lightning-bolt' },
    { id: 'autism', label: 'Autism', icon: 'puzzle' },
    { id: 'dyslexia', label: 'Dyslexia', icon: 'book-open-variant' },
    { id: 'anxiety', label: 'Anxiety', icon: 'heart-pulse' },
    { id: 'depression', label: 'Depression', icon: 'emoticon-sad' },
    { id: 'ocd', label: 'OCD', icon: 'sync' },
    { id: 'other', label: 'Other', icon: 'dots-horizontal' },
    { id: 'prefer-not-say', label: 'Prefer not to say', icon: 'eye-off' },
  ];

  const toggleNeurodiversityType = (typeId) => {
    if (neurodiversityTypes.includes(typeId)) {
      setNeurodiversityTypes(neurodiversityTypes.filter(t => t !== typeId));
    } else {
      setNeurodiversityTypes([...neurodiversityTypes, typeId]);
    }
  };

  const handleComplete = async () => {
    if (neurodiversityTypes.length === 0) {
      alert('Please select at least one option or "Prefer not to say"');
      return;
    }

    setLoading(true);

    try {
      // Create complete profile data
      const completeProfile = {
        ...profileData,
        neurodiversity_type: neurodiversityTypes,
        preferences: {
          notifications,
          daily_reminders: dailyReminders,
        },
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(doc(db, 'user_profiles', user.uid), completeProfile);

      // Update auth context
      if (updateUserProfile) {
        await updateUserProfile(completeProfile);
      }

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Save minimal profile and continue
    handleComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="brain" size={64} color={colors.primary} />
          <Title style={styles.title}>Personalize Your Experience</Title>
          <Text style={styles.subtitle}>
            Help us understand your needs better (optional but recommended)
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
        <Text style={styles.progressText}>Step 2 of 2</Text>

        {/* Neurodiversity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I identify with: *</Text>
          <Text style={styles.sectionSubtitle}>
            Select all that apply. This helps us provide relevant content.
          </Text>
          
          <View style={styles.chipsContainer}>
            {neurodiversityOptions.map((option) => (
              <Chip
                key={option.id}
                selected={neurodiversityTypes.includes(option.id)}
                onPress={() => toggleNeurodiversityType(option.id)}
                style={styles.chip}
                icon={option.icon}
                mode={neurodiversityTypes.includes(option.id) ? 'flat' : 'outlined'}
              >
                {option.label}
              </Chip>
            ))}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons name="bell" size={24} color={colors.primary} />
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Enable Notifications</Text>
                <Text style={styles.preferenceSubtitle}>
                  Get updates about your progress and reminders
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              color={colors.primary}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color={colors.primary} />
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Daily Reminders</Text>
                <Text style={styles.preferenceSubtitle}>
                  Gentle reminders to complete your daily exercises
                </Text>
              </View>
            </View>
            <Switch
              value={dailyReminders}
              onValueChange={setDailyReminders}
              color={colors.primary}
            />
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyBox}>
          <MaterialCommunityIcons name="shield-check" size={20} color={colors.primary} />
          <Text style={styles.privacyText}>
            Your information is private and secure. We never share your data with third parties.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <Button
          mode="text"
          onPress={handleSkip}
          disabled={loading}
          style={styles.skipButton}
        >
          Skip for now
        </Button>
        <Button
          mode="contained"
          onPress={handleComplete}
          loading={loading}
          disabled={loading || neurodiversityTypes.length === 0}
          style={styles.completeButton}
          contentStyle={styles.completeButtonContent}
        >
          Complete Setup
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent3,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.accent3,
    marginHorizontal: spacing.xs,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.subtext,
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent3,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.subtext,
  },
  privacyBox: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.text,
    lineHeight: 18,
  },
  bottomContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.accent3,
    gap: spacing.sm,
  },
  skipButton: {
    borderRadius: 12,
  },
  completeButton: {
    borderRadius: 12,
  },
  completeButtonContent: {
    paddingVertical: spacing.xs,
  },
});

export default OnboardingPreferencesScreen;
