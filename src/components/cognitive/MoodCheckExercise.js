import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';
import { colors, spacing, typography } from '../../config/theme';

const MoodCheckExercise = ({ exercise, onComplete }) => {
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    { name: "Happy", emoji: "😊" },
    { name: "Okay", emoji: "😐" },
    { name: "Sad", emoji: "😢" }
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleComplete = () => {
    if (selectedMood) {
      onComplete(1, 1); // Completed successfully
    }
  };

  return (
    <View style={styles.exerciseContainer}>
      <Title style={styles.exerciseTitle}>How are you feeling?</Title>
      <Text style={styles.exerciseSubtitle}>Select your mood</Text>
      
      <View style={styles.moodContainer}>
        {moods.map((mood, index) => (
          <Button
            key={index}
            mode={selectedMood === mood ? "contained" : "outlined"}
            onPress={() => handleMoodSelect(mood)}
            style={styles.moodButton}
          >
            {mood.emoji} {mood.name}
          </Button>
        ))}
      </View>
      
      {selectedMood && (
        <Button mode="contained" onPress={handleComplete}>
          Complete
        </Button>
      )}
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
  moodContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  moodButton: {
    marginVertical: spacing.xs,
  },
});

export default MoodCheckExercise; 
