import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Title, Text } from 'react-native-paper';
import { colors, spacing, typography } from '../../config/theme';

const NumberOrderExercise = ({ exercise, onComplete, fullScreen = false }) => {
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [targetSequence, setTargetSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [showSequence, setShowSequence] = useState(true);
  const [sequenceLength, setSequenceLength] = useState(3);

  // Auto-start the game when component mounts
  useEffect(() => {
    generateSequence();
  }, []);

  const generateSequence = () => {
    // Generate random sequence of numbers
    const numbers = [];
    const maxNumber = Math.min(9, sequenceLength + 3); // Increase difficulty gradually
    
    for (let i = 0; i < sequenceLength; i++) {
      let num;
      do {
        num = Math.floor(Math.random() * maxNumber) + 1;
      } while (numbers.includes(num));
      numbers.push(num);
    }

    setTargetSequence(numbers);
    setCurrentSequence(numbers);
    setUserSequence([]);
    setFeedback('');
    setIsAnswering(false);
    setShowSequence(true);

    // Show sequence for a few seconds, then hide it
    setTimeout(() => {
      setShowSequence(false);
      setIsAnswering(true);
    }, 2000 + (sequenceLength * 500)); // More time for longer sequences
  };

  const handleNumberTap = (number) => {
    if (!isAnswering) return;

    const newUserSequence = [...userSequence, number];
    setUserSequence(newUserSequence);

    // Check if the current number is correct
    const currentIndex = newUserSequence.length - 1;
    const isCorrect = number === targetSequence[currentIndex];

    if (!isCorrect) {
      // Wrong number - end this round
      setFeedback('Wrong! ✗');
      setIsAnswering(false);
      
      const newQuestionCount = questionCount + 1;
      setQuestionCount(newQuestionCount);
      
      setTimeout(() => {
        if (newQuestionCount >= 10) {
          endGame();
        } else {
        }
      }, 1500);
      return;
    }

    // Check if sequence is complete
    if (newUserSequence.length === targetSequence.length) {
      // Correct sequence completed!
      const newScore = score + 1;
      setScore(newScore);
      setFeedback('Correct! ✓');
      setIsAnswering(false);
      
      const newQuestionCount = questionCount + 1;
      setQuestionCount(newQuestionCount);
      
      // Increase difficulty every 3 correct answers
      if (newScore % 3 === 0 && sequenceLength < 6) {
        setSequenceLength(sequenceLength + 1);
      }
      
      setTimeout(() => {
        if (newQuestionCount >= 10) {
          endGame(newScore);
        } else {
          generateSequence();
        }
      }, 1500);
    }
  };

  const endGame = (finalScore) => {
    if (finalScore >= 10) {
      alert('Congratulations! You have completed the exercise with a perfect score of 10/10.');
    } else {
      alert(`You have completed the exercise with a score of ${finalScore}/10.`);
    }
    onClose();
  };

  // Show loading state if no sequence is generated yet
  if (currentSequence.length === 0) {
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
      
      <View style={styles.instructionArea}>
        <Text style={styles.instruction}>
          {showSequence ? 'Memorize this sequence:' : 'Tap the numbers in order:'}
        </Text>
        <Text style={styles.difficulty}>Length: {sequenceLength}</Text>
      </View>
      
      {showSequence && (
        <View style={styles.sequenceDisplay}>
          {targetSequence.map((number, index) => (
            <View key={index} style={styles.sequenceNumber}>
              <Text style={styles.sequenceNumberText}>{number}</Text>
            </View>
          ))}
        </View>
      )}
      
      {!showSequence && (
        <View style={styles.inputArea}>
          <Text style={styles.progressText}>
            Progress: {userSequence.length}/{targetSequence.length}
          </Text>
          <View style={styles.userSequence}>
            {userSequence.map((number, index) => (
              <Text key={index} style={styles.userNumber}>{number}</Text>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.numberGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <TouchableOpacity
            key={number}
            style={[
              styles.numberButton,
              !isAnswering && styles.disabledButton
            ]}
            onPress={() => handleNumberTap(number)}
            disabled={!isAnswering}
          >
            <Text style={[
              styles.numberText,
              !isAnswering && styles.disabledText
            ]}>
              {number}
            </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.text,
    textAlign: 'center',
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
  instructionArea: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  instruction: {
    ...typography.headlineSmall,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  difficulty: {
    ...typography.bodyMedium,
    color: colors.subtext,
    textAlign: 'center',
  },
  sequenceDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  sequenceNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sequenceNumberText: {
    ...typography.bodyLarge,
    color: colors.surface,
    fontWeight: 'bold',
  },
  inputArea: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressText: {
    ...typography.bodyMedium,
    color: colors.subtext,
    marginBottom: spacing.sm,
  },
  userSequence: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  userNumber: {
    ...typography.bodyLarge,
    color: colors.primary,
    fontWeight: 'bold',
    marginHorizontal: spacing.xs,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    width: '100%',
  },
  numberButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  disabledButton: {
    backgroundColor: colors.accent3,
    opacity: 0.5,
  },
  numberText: {
    ...typography.bodyLarge,
    fontWeight: 'bold',
    color: colors.surface,
  },
  disabledText: {
    color: colors.subtext,
  },
  feedback: {
    ...typography.bodyLarge,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default NumberOrderExercise; 
