import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';
import { colors, spacing, typography } from '../../config/theme';

const BreatheTimerExercise = ({ exercise, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onComplete(1, 1); // Completed successfully
    }
  }, [isActive, timeLeft]);

  const startTimer = () => {
    setIsActive(true);
  };

  return (
    <View style={styles.exerciseContainer}>
      <Title style={styles.exerciseTitle}>Breathe for 30 seconds</Title>
      <Text style={styles.exerciseSubtitle}>Focus on your breathing</Text>
      
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{timeLeft}</Text>
        {!isActive && (
          <Button mode="contained" onPress={startTimer}>
            Start
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  exerciseSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timerText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
});

export default BreatheTimerExercise; 