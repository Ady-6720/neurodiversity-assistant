import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';
import { colors, spacing, typography } from '../../config/theme';

const DailyChecklistExercise = ({ exercise, onComplete }) => {
  const [checkedItems, setCheckedItems] = useState([]);

  const tasks = [
    "Brush your teeth",
    "Make your bed", 
    "Drink water",
    "Take a walk",
    "Read something"
  ];

  const handleCheck = (index) => {
    if (checkedItems.includes(index)) {
      setCheckedItems(checkedItems.filter(i => i !== index));
    } else {
      setCheckedItems([...checkedItems, index]);
    }
  };

  const handleComplete = () => {
    onComplete(checkedItems.length, tasks.length);
  };

  return (
    <View style={styles.exerciseContainer}>
      <Title style={styles.exerciseTitle}>Daily Checklist</Title>
      <Text style={styles.exerciseSubtitle}>Check off completed tasks</Text>
      
      <View style={styles.checklistContainer}>
        {tasks.map((task, index) => (
          <Button
            key={index}
            mode={checkedItems.includes(index) ? "contained" : "outlined"}
            onPress={() => handleCheck(index)}
            style={styles.checklistItem}
          >
            {task}
          </Button>
        ))}
      </View>
      
      <Button mode="contained" onPress={handleComplete}>
        Complete ({checkedItems.length}/{tasks.length})
      </Button>
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
  checklistContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
    width: '100%',
  },
  checklistItem: {
    marginVertical: spacing.xs,
  },
});

export default DailyChecklistExercise; 
