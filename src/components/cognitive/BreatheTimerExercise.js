import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { Title, Text, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../config/theme';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width * 0.6, 280);

const BreatheTimerExercise = ({ exercise, onComplete }) => {
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('ready'); // ready, inhale, hold, exhale
  const [customTime, setCustomTime] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const durations = [
    { label: '30s', value: 30, icon: 'clock-fast' },
    { label: '1 min', value: 60, icon: 'clock-outline' },
    { label: '2 min', value: 120, icon: 'clock' },
    { label: '5 min', value: 300, icon: 'clock-time-eight' },
  ];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeLeft === 0) {
      onComplete(1, 1);
    }
  }, [isActive, timeLeft]);

  // Breathing animation cycle
  useEffect(() => {
    if (!isActive) return;

    const inhaleTime = 4000;  // 4 seconds
    const holdTime = 4000;    // 4 seconds
    const exhaleTime = 4000;  // 4 seconds
    const cycleTime = inhaleTime + holdTime + exhaleTime;

    let animationTimeout;

    const breathCycle = () => {
      // Phase 1: Inhale
      setBreathPhase('inhale');
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: inhaleTime,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: inhaleTime,
          useNativeDriver: true,
        }),
      ]).start();

      // Phase 2: Hold (after inhale completes)
      animationTimeout = setTimeout(() => {
        setBreathPhase('hold');
        // Keep the circle at max size during hold
      }, inhaleTime);

      // Phase 3: Exhale (after hold completes)
      animationTimeout = setTimeout(() => {
        setBreathPhase('exhale');
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.7,
            duration: exhaleTime,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: exhaleTime,
            useNativeDriver: true,
          }),
        ]).start();
      }, inhaleTime + holdTime);
    };

    // Start first cycle immediately
    breathCycle();
    
    // Repeat cycle
    const interval = setInterval(breathCycle, cycleTime);
    
    return () => {
      clearInterval(interval);
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [isActive, scaleAnim, opacityAnim]);

  const startTimer = (duration) => {
    setSelectedDuration(duration);
    setTimeLeft(duration);
    setTotalTime(duration);
    setIsActive(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSelectedDuration(null);
    setTimeLeft(0);
    setBreathPhase('ready');
    scaleAnim.setValue(0.7);
    opacityAnim.setValue(1);
  };

  const getPhaseText = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
      default: return 'Get Ready';
    }
  };

  const getPhaseColor = () => {
    switch (breathPhase) {
      case 'inhale': return '#4CAF50';
      case 'hold': return '#FFC107';
      case 'exhale': return '#2196F3';
      default: return colors.primary;
    }
  };

  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  if (!isActive && selectedDuration === null) {
    return (
      <View style={styles.exerciseContainer}>
        <MaterialCommunityIcons name="lungs" size={60} color={colors.primary} style={styles.icon} />
        <Title style={styles.exerciseTitle}>Breathing Exercise</Title>
        <Text style={styles.exerciseSubtitle}>Choose your duration</Text>
        
        <View style={styles.durationGrid}>
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration.value}
              style={styles.durationCard}
              onPress={() => startTimer(duration.value)}
            >
              <MaterialCommunityIcons name={duration.icon} size={28} color={colors.primary} />
              <Text style={styles.durationLabel}>{duration.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Time Input */}
        <View style={styles.customTimeContainer}>
          <Text style={styles.customTimeLabel}>Or enter custom time (seconds):</Text>
          <View style={styles.customTimeRow}>
            <TextInput
              style={styles.customTimeInput}
              value={customTime}
              onChangeText={setCustomTime}
              placeholder="60"
              keyboardType="numeric"
              maxLength={4}
            />
            <TouchableOpacity
              style={[styles.customTimeButton, !customTime && styles.customTimeButtonDisabled]}
              onPress={() => {
                const time = parseInt(customTime);
                if (time && time > 0 && time <= 3600) {
                  startTimer(time);
                }
              }}
              disabled={!customTime}
            >
              <Text style={styles.customTimeButtonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.instructionText}>
          🟢 Breathe In • 🟡 Hold • 🔵 Breathe Out
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.exerciseContainer, { backgroundColor: getPhaseColor() + '10' }]}>
      <View style={styles.header}>
        <Text style={styles.timeRemaining}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
        <IconButton icon="close" size={24} onPress={resetTimer} />
      </View>

      <View style={styles.breathingContainer}>
        <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
          {getPhaseText()}
        </Text>

        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              backgroundColor: getPhaseColor(),
            },
          ]}
        >
          <View style={styles.innerCircle}>
            <MaterialCommunityIcons name="lungs" size={60} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* Progress Ring */}
        <View style={styles.progressRing}>
          <View style={[styles.progressFill, { 
            width: `${progress * 100}%`,
            backgroundColor: getPhaseColor() 
          }]} />
        </View>

        <Text style={styles.instructionText}>
          {breathPhase === 'inhale' && '🟢 Slowly breathe in through your nose'}
          {breathPhase === 'hold' && '🟡 Hold your breath gently'}
          {breathPhase === 'exhale' && '🔵 Slowly breathe out through your mouth'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: spacing.md,
  },
  exerciseTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  exerciseSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  durationCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  durationLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  timeRemaining: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  phaseText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  breathingCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  innerCircle: {
    width: CIRCLE_SIZE * 0.7,
    height: CIRCLE_SIZE * 0.7,
    borderRadius: (CIRCLE_SIZE * 0.7) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: '80%',
    height: 8,
    backgroundColor: colors.accent3,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  instructionText: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  customTimeContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  customTimeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customTimeInput: {
    flex: 1,
    maxWidth: 120,
    height: 48,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  customTimeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  customTimeButtonDisabled: {
    backgroundColor: colors.accent3,
  },
  customTimeButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});

export default BreatheTimerExercise; 
