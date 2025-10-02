import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';
import { colors, spacing, typography } from '../../config/theme';

const ThisOrThatExercise = ({ exercise, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const questions = [
    { question: "Which is bigger?", options: ["Elephant", "Mouse"] },
    { question: "Which is faster?", options: ["Turtle", "Cheetah"] },
    { question: "Which is hotter?", options: ["Ice", "Fire"] },
    { question: "Which is taller?", options: ["Tree", "Grass"] },
    { question: "Which is louder?", options: ["Whisper", "Shout"] }
  ];

  const handleChoice = (choice) => {
    const correctAnswers = ["Elephant", "Cheetah", "Fire", "Tree", "Shout"];
    const isCorrect = choice === correctAnswers[currentQuestion];
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    if (currentQuestion + 1 >= questions.length) {
      onComplete(score + (isCorrect ? 1 : 0), questions.length);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const question = questions[currentQuestion];

  return (
    <View style={styles.exerciseContainer}>
      <Title style={styles.exerciseTitle}>{question.question}</Title>
      <Text style={styles.exerciseSubtitle}>Question {currentQuestion + 1} of {questions.length}</Text>
      
      <View style={styles.choiceContainer}>
        {question.options.map((option, index) => (
          <Button
            key={index}
            mode="contained"
            style={styles.choiceButton}
            onPress={() => handleChoice(option)}
          >
            {option}
          </Button>
        ))}
      </View>
      
      <Text style={styles.scoreText}>Score: {score}/{currentQuestion}</Text>
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
  choiceContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  choiceButton: {
    marginVertical: spacing.xs,
  },
  scoreText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});

export default ThisOrThatExercise; 
