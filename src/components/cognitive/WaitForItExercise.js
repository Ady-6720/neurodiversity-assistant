import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Title, Text, Button, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../config/theme';

const WaitForItExercise = ({ exercise, onComplete }) => {
  const [gameState, setGameState] = useState('ready'); // ready, waiting, go, finished
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const totalRounds = 10;

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setGameState('ready');
    setScore(0);
    setRound(0);
    startNextRound();
  };

  const startNextRound = () => {
    // Random wait time between 3-7 seconds
    const randomWait = Math.floor(Math.random() * 5) + 3;
    setWaitTime(randomWait);
    setCountdown(randomWait);
    setGameState('waiting');
    setFeedback('DON\'T TAP YET!');
    
    // Start countdown
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          showGo();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showGo = () => {
    setGameState('go');
    setFeedback('GO! TAP NOW!');
    
    // Animate button
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-advance after 2 seconds if no tap
    timeoutRef.current = setTimeout(() => {
      if (gameState === 'go') {
        handleMissed();
      }
    }, 2000);
  };

  const handleButtonPress = () => {
    if (gameState === 'waiting') {
      // Too early!
      setFeedback('Too early! You must wait! ❌');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setTimeout(() => {
        moveToNextRound(score);
      }, 1500);
    } else if (gameState === 'go') {
      // Correct!
      const newScore = score + 1;
      setScore(newScore);
      setFeedback('Perfect timing! ✓');
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setTimeout(() => {
        moveToNextRound(newScore);
      }, 1000);
    }
  };

  const handleMissed = () => {
    setFeedback('Too slow! ⏱️');
    setTimeout(() => {
      moveToNextRound(score);
    }, 1000);
  };

  const moveToNextRound = (currentScore) => {
    const newRound = round + 1;
    setRound(newRound);
    
    if (newRound >= totalRounds) {
      // Game over
      setGameState('finished');
      setFeedback(`Finished! Score: ${currentScore}/${totalRounds}`);
      
      setTimeout(() => {
        onComplete(currentScore, totalRounds);
      }, 1500);
    } else {
      startNextRound();
    }
  };

  const getButtonColor = () => {
    if (gameState === 'waiting') return '#EF4444'; // Red
    if (gameState === 'go') return '#10B981'; // Green
    return colors.primary;
  };

  if (gameState === 'ready' && round === 0) {
    return (
      <View style={styles.exerciseContainer}>
        <MaterialCommunityIcons name="timer-sand" size={80} color={colors.primary} />
        <Title style={styles.exerciseTitle}>Wait For It</Title>
        <Text style={styles.instructions}>
          • A countdown timer will appear{'\n'}
          • DON'T tap the button while it's counting down{'\n'}
          • Wait until it says "GO!"{'\n'}
          • Then tap as fast as you can!{'\n\n'}
          This tests your patience and impulse control.
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
      
      <View style={styles.mainContent}>
        <Text style={[styles.feedback, gameState === 'go' && styles.feedbackActive]}>
          {feedback}
        </Text>
        
        {gameState === 'waiting' && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{countdown}</Text>
            <ProgressBar 
              progress={(waitTime - countdown) / waitTime} 
              color={colors.primary}
              style={styles.progressBar}
            />
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleButtonPress}
            activeOpacity={0.8}
            disabled={gameState === 'finished'}
          >
            <Animated.View
              style={[
                styles.waitButton,
                { 
                  backgroundColor: getButtonColor(),
                  transform: [{ scale: buttonScale }]
                }
              ]}
            >
              <Text style={styles.buttonText}>
                {gameState === 'waiting' ? 'WAIT...' : 'TAP!'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.hint}>
          {gameState === 'waiting' && '⏳ Be patient... don\'t tap yet!'}
          {gameState === 'go' && '✅ NOW! Tap the button!'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    flex: 1,
    padding: spacing.md,
  },
  exerciseTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  instructions: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginVertical: spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  roundText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  scoreText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedback: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    minHeight: 30,
  },
  feedbackActive: {
    color: '#10B981',
    fontSize: typography.sizes.xl,
  },
  countdownContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  countdownText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  waitButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default WaitForItExercise;
