import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../config/theme';

const StopThinkExercise = ({ exercise, onComplete }) => {
  const [gameState, setGameState] = useState('ready'); // ready, waiting, red, yellow, green, finished
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [currentLight, setCurrentLight] = useState('red');
  const lightScale = useRef(new Animated.Value(1)).current;
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
    startNextRound();
  };

  const startNextRound = () => {
    setGameState('waiting');
    setFeedback('Get ready...');
    setCurrentLight('red');
    
    // Start with red light
    timeoutRef.current = setTimeout(() => {
      setCurrentLight('red');
      setFeedback('STOP! Wait for green...');
      
      // Random delay before yellow (2-4 seconds)
      const yellowDelay = Math.random() * 2000 + 2000;
      
      timeoutRef.current = setTimeout(() => {
        setCurrentLight('yellow');
        setFeedback('Get ready...');
        
        // Yellow light for 1-2 seconds
        const greenDelay = Math.random() * 1000 + 1000;
        
        timeoutRef.current = setTimeout(() => {
          setCurrentLight('green');
          setGameState('green');
          setFeedback('GO! Tap now!');
          
          // Animate the green light
          Animated.sequence([
            Animated.spring(lightScale, {
              toValue: 1.2,
              useNativeDriver: true,
            }),
            Animated.spring(lightScale, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
          
          // Auto-advance after 2 seconds if no tap
          timeoutRef.current = setTimeout(() => {
            if (gameState === 'green') {
              handleMissed();
            }
          }, 2000);
        }, greenDelay);
      }, yellowDelay);
    }, 500);
  };

  const handleTap = () => {
    if (gameState === 'waiting' || currentLight === 'red' || currentLight === 'yellow') {
      // Too early!
      setFeedback('Too early! Wait for GREEN! ❌');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setTimeout(() => {
        moveToNextRound(score);
      }, 1500);
    } else if (gameState === 'green' && currentLight === 'green') {
      // Correct!
      const newScore = score + 1;
      setScore(newScore);
      setFeedback('Perfect! ✓');
      
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

  const getLightColor = () => {
    switch (currentLight) {
      case 'red': return '#EF4444';
      case 'yellow': return '#F59E0B';
      case 'green': return '#10B981';
      default: return '#9CA3AF';
    }
  };

  if (gameState === 'ready' && round === 0) {
    return (
      <View style={styles.exerciseContainer}>
        <MaterialCommunityIcons name="traffic-light" size={80} color={colors.primary} />
        <Title style={styles.exerciseTitle}>Stop & Think</Title>
        <Text style={styles.instructions}>
          🔴 RED = STOP (Don't tap!){'\n'}
          🟡 YELLOW = Get ready{'\n'}
          🟢 GREEN = GO! (Tap now!){'\n\n'}
          Wait for the green light before tapping.{'\n'}
          Tapping too early will count as wrong!
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
        <Text style={[styles.feedback, gameState === 'green' && styles.feedbackActive]}>
          {feedback}
        </Text>
        
        <View style={styles.trafficLightContainer}>
          <TouchableOpacity
            onPress={handleTap}
            activeOpacity={0.8}
            disabled={gameState === 'finished'}
          >
            <Animated.View
              style={[
                styles.trafficLight,
                { 
                  backgroundColor: getLightColor(),
                  transform: [{ scale: lightScale }]
                }
              ]}
            >
              <MaterialCommunityIcons 
                name={currentLight === 'red' ? 'hand-back-right' : currentLight === 'yellow' ? 'clock-alert' : 'check-bold'} 
                size={56} 
                color="#FFFFFF"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.hint}>
          {currentLight === 'red' && '🛑 STOP - Don\'t tap yet!'}
          {currentLight === 'yellow' && '⚠️ Get ready...'}
          {currentLight === 'green' && '✅ TAP NOW!'}
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
  trafficLightContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  trafficLight: {
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
  hint: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default StopThinkExercise;
