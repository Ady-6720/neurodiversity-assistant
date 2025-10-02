import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../config/theme';

const BigButtonExercise = ({ exercise, onComplete }) => {
  const [gameState, setGameState] = useState('ready'); // ready, waiting, active, finished
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [reactionTimes, setReactionTimes] = useState([]);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  const totalRounds = 10;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setGameState('ready');
    setScore(0);
    setRound(0);
    setReactionTimes([]);
    startNextRound();
  };

  const startNextRound = () => {
    setGameState('waiting');
    setFeedback('Wait for GREEN...');
    
    // Random delay between 1-4 seconds
    const delay = Math.random() * 3000 + 1000;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('active');
      setFeedback('TAP NOW!');
      startTimeRef.current = Date.now();
      
      // Animate button
      Animated.sequence([
        Animated.spring(buttonScale, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  };

  const handleButtonPress = () => {
    if (gameState === 'waiting') {
      // Too early!
      setFeedback('Too early! ');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setTimeout(() => {
        moveToNextRound(0, null);
      }, 1000);
    } else if (gameState === 'active') {
      // Correct!
      const reactionTime = Date.now() - startTimeRef.current;
      const newScore = score + 1;
      setScore(newScore);
      setFeedback(`Great! ${reactionTime}ms `);
      setReactionTimes([...reactionTimes, reactionTime]);
      
      setTimeout(() => {
        moveToNextRound(newScore, reactionTime);
      }, 1000);
    }
  };

  const moveToNextRound = (currentScore, reactionTime) => {
    const newRound = round + 1;
    setRound(newRound);
    
    if (newRound >= totalRounds) {
      // Game over
      const avgReactionTime = reactionTimes.length > 0 
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 0;
      
      setGameState('finished');
      setFeedback(`Finished! Avg: ${avgReactionTime}ms`);
      
      // Pass final score to parent
      setTimeout(() => {
        onComplete(currentScore, totalRounds);
      }, 1500);
    } else {
      startNextRound();
    }
  };

  const getButtonColor = () => {
    if (gameState === 'waiting') return '#EF4444'; // Red
    if (gameState === 'active') return '#10B981'; // Green
    return colors.primary;
  };

  const getButtonText = () => {
    if (gameState === 'ready') return 'START';
    if (gameState === 'waiting') return 'WAIT...';
    if (gameState === 'active') return 'TAP!';
    return 'DONE';
  };

  if (gameState === 'ready' && round === 0) {
    return (
      <View style={styles.exerciseContainer}>
        <MaterialCommunityIcons name="gesture-tap" size={80} color={colors.primary} />
        <Title style={styles.exerciseTitle}>Reaction Time Test</Title>
        <Text style={styles.instructions}>
          • Wait for the button to turn GREEN{'\n'}
          • Tap as fast as you can!{'\n'}
          • Don't tap when it's RED{'\n'}
          • Complete 10 rounds
        </Text>
        <Button 
          mode="contained" 
          onPress={startGame}
          style={styles.startButton}
          buttonColor={colors.primary}
        >
          Start Game
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.exerciseContainer}>
      <View style={styles.header}>
        <Text style={styles.roundText}>Round {round + 1}/{totalRounds}</Text>
        <Text style={styles.scoreText}>Score: {score}/{round}</Text>
      </View>
      
      <Text style={[styles.feedback, gameState === 'active' && styles.feedbackActive]}>
        {feedback}
      </Text>
      
      <View style={styles.bigButtonContainer}>
        <TouchableOpacity
          onPress={handleButtonPress}
          activeOpacity={0.8}
          disabled={gameState === 'finished'}
        >
          <Animated.View
            style={[
              styles.bigButton,
              { 
                backgroundColor: getButtonColor(),
                transform: [{ scale: buttonScale }]
              }
            ]}
          >
            <Text style={styles.bigButtonText}>{getButtonText()}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      {reactionTimes.length > 0 && (
        <Text style={styles.avgText}>
          Avg Reaction: {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  instructions: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    marginVertical: spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.lg,
  },
  roundText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  scoreText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  feedback: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
    minHeight: 40,
  },
  feedbackActive: {
    color: colors.primary,
    fontSize: typography.sizes.xl,
  },
  bigButtonContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  bigButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bigButtonText: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  avgText: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    marginTop: spacing.lg,
  },
});

export default BigButtonExercise; 
