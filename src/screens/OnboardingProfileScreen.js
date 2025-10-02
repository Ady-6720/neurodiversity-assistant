import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../config/theme';

const OnboardingProfileScreen = ({ navigation, route }) => {
  const { user } = route.params || {};
  
  const [displayName, setDisplayName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const pronounOptions = [
    'he/him',
    'she/her',
    'they/them',
    'he/they',
    'she/they',
    'other'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }
    
    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || parseInt(age) < 1 || parseInt(age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Navigate to next onboarding screen with data
    navigation.navigate('OnboardingPreferences', {
      user,
      profileData: {
        display_name: displayName.trim(),
        pronouns: pronouns || 'prefer not to say',
        age: parseInt(age),
      }
    });
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="account-circle" size={64} color={colors.primary} />
            <Title style={styles.title}>Let's get to know you!</Title>
            <Text style={styles.subtitle}>
              Tell us a bit about yourself to personalize your experience
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
          </View>
          <Text style={styles.progressText}>Step 1 of 2</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Display Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>What should we call you? *</Text>
              <TextInput
                mode="outlined"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                style={styles.input}
                error={!!errors.displayName}
                left={<TextInput.Icon icon="account" />}
              />
              {errors.displayName && (
                <HelperText type="error" visible={!!errors.displayName}>
                  {errors.displayName}
                </HelperText>
              )}
            </View>

            {/* Pronouns */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pronouns (optional)</Text>
              <View style={styles.chipsContainer}>
                {pronounOptions.map((option) => (
                  <Chip
                    key={option}
                    selected={pronouns === option}
                    onPress={() => setPronouns(pronouns === option ? '' : option)}
                    style={styles.chip}
                    mode={pronouns === option ? 'flat' : 'outlined'}
                  >
                    {option}
                  </Chip>
                ))}
              </View>
              {pronouns === 'other' && (
                <TextInput
                  mode="outlined"
                  value={pronouns === 'other' ? '' : pronouns}
                  onChangeText={setPronouns}
                  placeholder="Specify your pronouns"
                  style={[styles.input, styles.inputMarginTop]}
                />
              )}
            </View>

            {/* Age */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age *</Text>
              <TextInput
                mode="outlined"
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.age}
                left={<TextInput.Icon icon="calendar" />}
              />
              {errors.age && (
                <HelperText type="error" visible={!!errors.age}>
                  {errors.age}
                </HelperText>
              )}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="information" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                This information helps us personalize your experience and provide age-appropriate content.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <Button
            mode="contained"
            onPress={handleContinue}
            loading={loading}
            disabled={loading}
            style={styles.continueButton}
            contentStyle={styles.continueButtonContent}
          >
            Continue
          </Button>
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
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  form: {
    marginTop: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
  },
  inputMarginTop: {
    marginTop: spacing.sm,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
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
  },
  continueButton: {
    borderRadius: 12,
  },
  continueButtonContent: {
    paddingVertical: spacing.xs,
  },
});

export default OnboardingProfileScreen;
