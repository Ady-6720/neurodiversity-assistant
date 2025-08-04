import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text } from 'react-native-paper';
import { colors, spacing, typography } from '../../config/theme';

const BigButtonExercise = ({ exercise, onComplete }) => {
  const [buttonVisible, setButtonVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    const showButton = () => {
      setButtonVisible(true);
      setTimeout(() => {
        setButtonVisible(false);
        setQuestionCount(questionCount + 1);
        
        if (questionCount + 1 >= 5) {
          onComplete(score, 5);
        } else {
          setTimeout(showButton, Math.random() * 2000 + 1000);
        }
      }, 1000);
    };
    
    setTimeout(showButton, 1000);
  }, [questionCount]);

  const handleButtonTap = () => {
    if (buttonVisible) {
      setScore(score + 1);
    }
  };

  return (
    <View style={styles.exerciseContainer}>
      <Title style={styles.exerciseTitle}>Tap the button when it appears</Title>
      <Text style={styles.exerciseSubtitle}>Question {questionCount + 1} of 5</Text>
      
      <View style={styles.bigButtonContainer}>
        {buttonVisible && (
          <View
            style={styles.bigButton}
            onTouchEnd={handleButtonTap}
          >
            <Text style={styles.bigButtonText}>TAP!</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.scoreText}>Score: {score}/{questionCount}</Text>
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
  bigButtonContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bigButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigButtonText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  scoreText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});

export default BigButtonExercise; 