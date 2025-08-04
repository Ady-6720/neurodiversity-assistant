import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Vibration,
  Platform
} from 'react-native';
import { Title, Text, Button, Card, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../config/theme';

const { height: screenHeight } = Dimensions.get('window');

const ColorTapExercise = ({ exercise, onComplete, fullScreen = false }) => {
  const [currentColor, setCurrentColor] = useState('');
  const [colorName, setColorName] = useState('');
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [totalQuestions] = useState(5);
  const [options, setOptions] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  
  const gameColors = [
    { name: 'red', color: '#FF5252', textColor: '#FFFFFF' },
    { name: 'blue', color: '#2196F3', textColor: '#FFFFFF' },
    { name: 'green', color: '#4CAF50', textColor: '#FFFFFF' },
    { name: 'yellow', color: '#FFEB3B', textColor: '#000000' },
    { name: 'purple', color: '#9C27B0', textColor: '#FFFFFF' },
    { name: 'orange', color: '#FF9800', textColor: '#FFFFFF' },
    { name: 'pink', color: '#E91E63', textColor: '#FFFFFF' },
    { name: 'teal', color: '#009688', textColor: '#FFFFFF' }
  ];

  const generateQuestion = () => {
    if (questionCount >= totalQuestions) {
      endGame();
      return;
    }
    
    const correctColorObj = gameColors[Math.floor(Math.random() * gameColors.length)];
    const colorNameObj = gameColors[Math.floor(Math.random() * gameColors.length)];
    
    // Create 4 options including the correct one
    let optionColors = [correctColorObj];
    while (optionColors.length < 4) {
      const randomColor = gameColors[Math.floor(Math.random() * gameColors.length)];
      if (!optionColors.find(c => c.name === randomColor.name)) {
        optionColors.push(randomColor);
      }
    }
    optionColors = optionColors.sort(() => Math.random() - 0.5); // Shuffle

    setCurrentColor(correctColorObj.color);
    setColorName(colorNameObj.name);
    setOptions(optionColors);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setQuestionCount(0);
    generateQuestion();
  };

  const endGame = () => {
    onComplete(score, totalQuestions);
  };

  const handleTap = async (selectedColor, selectedColorName) => {
    if (isAnswering) return;
    
    setIsAnswering(true);
    const isCorrect = selectedColorName === colorName;
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(50);
    }
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    // Show feedback
    setFeedback(isCorrect ? 'Correct! 🎉' : 'Wrong! 😔');
    setShowFeedback(true);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Animate feedback
    Animated.sequence([
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(feedbackAnim, {
        toValue: 0,
        duration: 200,
        delay: 800,
        useNativeDriver: true
      })
    ]).start();
    
    setTimeout(() => {
      setShowFeedback(false);
      setQuestionCount(questionCount + 1);
      
      if (questionCount + 1 >= totalQuestions) {
        endGame();
      } else {
        generateQuestion();
      }
      setIsAnswering(false);
    }, 1000);
  };

  const getProgressPercentage = () => {
    return questionCount / totalQuestions;
  };

  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <Card style={styles.startCard}>
          <Card.Content style={styles.startCardContent}>
            <MaterialCommunityIcons 
              name="palette" 
              size={60} 
              color={colors.primary} 
              style={styles.startIcon}
            />
            <Title style={styles.startTitle}>Color Match</Title>
            <Text style={styles.startDescription}>
              Tap the correct color that matches the name shown.
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="target" size={20} color={colors.primary} />
                <Text style={styles.statText}>5 Questions</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
                <Text style={styles.statText}>No Time Limit</Text>
              </View>
            </View>
            
            <Button 
              mode="contained" 
              onPress={startGame}
              style={styles.startButton}
            >
              Start Game
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={getProgressPercentage()} 
            color={colors.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {questionCount + 1} of {totalQuestions}
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <MaterialCommunityIcons name="star" size={16} color={colors.warning} />
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>Tap the color:</Text>
        <Text style={styles.colorName}>{colorName}</Text>
      </View>

      {/* 2x2 Color Grid */}
      <View style={styles.gridContainer}>
        <Text style={styles.debugText}>Options: {options.length}</Text>
        <View style={styles.gridRow}>
          {options.slice(0, 2).map((colorObj, index) => (
            <Animated.View
              key={index}
              style={[
                styles.colorTile,
                { 
                  backgroundColor: colorObj.color,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.colorTouchable}
                onPress={() => handleTap(colorObj.color, colorObj.name)}
                activeOpacity={0.8}
                disabled={isAnswering}
              >
                <Text style={[
                  styles.colorText,
                  { color: colorObj.textColor }
                ]}>
                  {colorObj.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        
        <View style={styles.gridRow}>
          {options.slice(2, 4).map((colorObj, index) => (
            <Animated.View
              key={index + 2}
              style={[
                styles.colorTile,
                { 
                  backgroundColor: colorObj.color,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.colorTouchable}
                onPress={() => handleTap(colorObj.color, colorObj.name)}
                activeOpacity={0.8}
                disabled={isAnswering}
              >
                <Text style={[
                  styles.colorText,
                  { color: colorObj.textColor }
                ]}>
                  {colorObj.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Feedback Overlay */}
      {showFeedback && (
        <Animated.View 
          style={[
            styles.feedbackOverlay,
            {
              opacity: feedbackAnim,
              transform: [{ scale: feedbackAnim }]
            }
          ]}
        >
          <Text style={[
            styles.feedbackText,
            { color: feedback === 'Correct! 🎉' ? colors.success : colors.error }
          ]}>
            {feedback}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.sm,
  },
  startCard: {
    margin: spacing.md,
    elevation: 4,
  },
  startCardContent: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  startIcon: {
    marginBottom: spacing.md,
  },
  startTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  startDescription: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: typography.sizes.xs,
    color: colors.subtext,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  startButton: {
    width: '100%',
  },
  header: {
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.subtext,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.highlight,
    borderRadius: spacing.sm,
  },
  scoreText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    flex: 0,
    justifyContent: 'center',
  },
  questionLabel: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  colorName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  gridContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 400,
    marginBottom: spacing.md,
  },
  colorTile: {
    width: '48%',
    height: 80,
    borderRadius: spacing.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  feedbackText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  debugText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});

export default ColorTapExercise; 