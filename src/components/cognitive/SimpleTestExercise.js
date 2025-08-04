import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../config/theme';

const SimpleTestExercise = ({ exercise, onComplete, fullScreen = false }) => {
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setQuestionCount(0);
  };

  const handleAnswer = (correct) => {
    if (correct) {
      setScore(score + 1);
    }
    setQuestionCount(questionCount + 1);
    
    if (questionCount + 1 >= 5) {
      onComplete(score + (correct ? 1 : 0), 5);
    }
  };

  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons 
          name={exercise?.icon || 'brain'} 
          size={80} 
          color={colors.primary} 
          style={styles.icon}
        />
        <Title style={styles.title}>{exercise?.title || 'Test Exercise'}</Title>
        <Text style={styles.description}>
          {exercise?.description || 'A simple test exercise'}
        </Text>
        <Button 
          mode="contained" 
          onPress={startGame}
          style={styles.startButton}
        >
          Start Game
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Question {questionCount + 1} of 5</Title>
      <Text style={styles.question}>Is this a test question?</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={() => handleAnswer(true)}
          style={styles.answerButton}
        >
          Yes
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => handleAnswer(false)}
          style={styles.answerButton}
        >
          No
        </Button>
      </View>
      
      <Text style={styles.score}>Score: {score}/{questionCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  startButton: {
    paddingHorizontal: spacing.lg,
  },
  question: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  answerButton: {
    flex: 1,
  },
  score: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});

export default SimpleTestExercise; 