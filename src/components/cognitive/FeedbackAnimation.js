import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FeedbackAnimation = ({ isCorrect, visible, onComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      rotateAnim.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate out after delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onComplete) onComplete();
        });
      }, 1000);
    }
  }, [visible]);

  if (!visible) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const backgroundColor = isCorrect ? '#10B981' : '#EF4444';
  const icon = isCorrect ? 'check-circle' : 'close-circle';
  const text = isCorrect ? 'Correct!' : 'Wrong!';
  const emoji = isCorrect ? '🎉' : '❌';

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor,
            transform: [
              { scale: scaleAnim },
              { rotate: isCorrect ? rotate : '0deg' },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={80} color="#FFFFFF" />
        <Text style={styles.text}>{text}</Text>
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>

      {/* Confetti effect for correct answers */}
      {isCorrect && (
        <>
          <Animated.View
            style={[
              styles.confetti,
              styles.confetti1,
              {
                opacity: opacityAnim,
                transform: [
                  { translateY: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -100] }) },
                  { translateX: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.confetti,
              styles.confetti2,
              {
                opacity: opacityAnim,
                transform: [
                  { translateY: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) },
                  { translateX: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.confetti,
              styles.confetti3,
              {
                opacity: opacityAnim,
                transform: [
                  { translateY: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -80] }) },
                  { translateX: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 70] }) },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.confetti,
              styles.confetti4,
              {
                opacity: opacityAnim,
                transform: [
                  { translateY: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -110] }) },
                  { translateX: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) },
                ],
              },
            ]}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  container: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  emoji: {
    fontSize: 32,
    marginTop: 5,
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  confetti1: {
    backgroundColor: '#FFD700',
  },
  confetti2: {
    backgroundColor: '#FF69B4',
  },
  confetti3: {
    backgroundColor: '#00CED1',
  },
  confetti4: {
    backgroundColor: '#FF6347',
  },
});

export default FeedbackAnimation;
