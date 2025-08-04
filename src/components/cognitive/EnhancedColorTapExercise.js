// src/components/cognitive/EnhancedColorTapExercise.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';
import { colors, spacing, typography } from '../../config/theme';

const EnhancedColorTapExercise = ({ exercise, onComplete, fullScreen = false }) => {
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [colorName, setColorName] = useState('');
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  
  const gameColors = [
    { name: 'Red', color: '#FF5252' },
    { name: 'Blue', color: '#2196F3' },
    { name: 'Green', color: '#4CAF50' },
    { name: 'Yellow', color: '#FFEB3B' },
    { name: 'Purple', color: '#9C27B0' },
    { name: 'Orange', color: '#FF9800' }
  ];

  // Auto-start the game when component mounts
  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = () => {
    if (questionCount >= 10) {
      endGame();
      return;
    }
    
    // Pick a random color name to display
    const targetColor = gameColors[Math.floor(Math.random() * gameColors.length)];
    setColorName(targetColor.name);
    
    // Create 4 options including the correct one
    let optionColors = [targetColor];
    while (optionColors.length < 4) {
      const randomColor = gameColors[Math.floor(Math.random() * gameColors.length)];
      if (!optionColors.find(c => c.name === randomColor.name)) {
        optionColors.push(randomColor);
      }
    }
    
    // Shuffle the options
    optionColors = optionColors.sort(() => Math.random() - 0.5);
    setOptions(optionColors);
    setFeedback('');
    setIsAnswering(false);
  };

  const handleAnswer = (selectedColor) => {
    if (isAnswering) return;
    
    setIsAnswering(true);
    const isCorrect = selectedColor.name === colorName;
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('Correct! ✓');
    } else {
      setFeedback('Wrong! ✗');
    }
    
    const newQuestionCount = questionCount + 1;
    setQuestionCount(newQuestionCount);
    
    setTimeout(() => {
      if (newQuestionCount >= 10) {
        endGame();
      } else {
        generateQuestion();
      }
    }, 1000);
  };

  const endGame = () => {
    onComplete(score, 10);
  };

  // Show loading state if no options are generated yet
  if (options.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.score}>Score: {score}/10</Text>
        <Text style={styles.progress}>Question {questionCount + 1}/10</Text>
      </View>
      
      <View style={styles.questionArea}>
        <Text style={styles.instruction}>Tap the color:</Text>
        <Text style={styles.colorName}>{colorName}</Text>
      </View>
      
      <View style={styles.optionsGrid}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.colorOption, { backgroundColor: option.color }]}
            onPress={() => handleAnswer(option)}
            disabled={isAnswering}
          >
            <Text style={styles.colorOptionText}>{option.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {feedback ? (
        <Text style={styles.feedback}>{feedback}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyLarge,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xl,
  },
  score: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: 'bold',
  },
  progress: {
    ...typography.bodyLarge,
    color: colors.subtext,
  },
  questionArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  instruction: {
    ...typography.headlineSmall,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  colorName: {
    ...typography.headlineLarge,
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 32,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xl,
  },
  colorOption: {
    width: '48%',
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  colorOptionText: {
    ...typography.bodyLarge,
    color: colors.surface,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  feedback: {
    ...typography.bodyLarge,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default EnhancedColorTapExercise;
