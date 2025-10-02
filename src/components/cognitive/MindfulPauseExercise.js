import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Text, Button, TextInput, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../config/theme';

const MindfulPauseExercise = ({ exercise, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    see: ['', '', '', '', ''],
    hear: ['', '', '', ''],
    feel: ['', '', ''],
    smell: ['', ''],
    taste: ['']
  });

  const steps = [
    {
      id: 'intro',
      title: 'Mindful Pause',
      subtitle: '5-4-3-2-1 Grounding Exercise',
      icon: 'hand-peace',
      color: '#8B5CF6',
      description: 'This exercise helps you ground yourself in the present moment by engaging all your senses. Take your time with each step.',
    },
    {
      id: 'see',
      title: '5 Things You See',
      subtitle: 'Look around you',
      icon: 'eye',
      color: '#3B82F6',
      description: 'Name 5 things you can see right now. Look for details you might not usually notice.',
      count: 5,
      key: 'see'
    },
    {
      id: 'hear',
      title: '4 Things You Hear',
      subtitle: 'Listen carefully',
      icon: 'ear-hearing',
      color: '#10B981',
      description: 'Name 4 things you can hear. Include both near and far sounds.',
      count: 4,
      key: 'hear'
    },
    {
      id: 'feel',
      title: '3 Things You Feel',
      subtitle: 'Physical sensations',
      icon: 'hand-back-right',
      color: '#F59E0B',
      description: 'Name 3 things you can physically feel (like your feet on the floor, clothes on your skin).',
      count: 3,
      key: 'feel'
    },
    {
      id: 'smell',
      title: '2 Things You Smell',
      subtitle: 'Notice scents',
      icon: 'flower',
      color: '#EC4899',
      description: 'Name 2 things you can smell. If you can\'t smell anything, name 2 of your favorite scents.',
      count: 2,
      key: 'smell'
    },
    {
      id: 'taste',
      title: '1 Thing You Taste',
      subtitle: 'Notice flavors',
      icon: 'food-apple',
      color: '#EF4444',
      description: 'Name 1 thing you can taste. If you can\'t taste anything, name your favorite flavor.',
      count: 1,
      key: 'taste'
    },
    {
      id: 'complete',
      title: 'Well Done!',
      subtitle: 'You\'ve completed the grounding exercise',
      icon: 'check-circle',
      color: '#10B981',
      description: 'Take a moment to notice how you feel now. Grounding exercises can help reduce anxiety and bring you back to the present moment.',
    }
  ];

  const currentStepData = steps[currentStep];

  const handleInputChange = (key, index, value) => {
    const newResponses = { ...responses };
    newResponses[key][index] = value;
    setResponses(newResponses);
  };

  const canProceed = () => {
    if (currentStep === 0 || currentStep === steps.length - 1) return true;
    
    const step = steps[currentStep];
    const stepResponses = responses[step.key];
    return stepResponses.every(r => r.trim().length > 0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate completion score
      const totalResponses = Object.values(responses).flat().filter(r => r.trim().length > 0).length;
      onComplete(totalResponses, 15); // 15 total possible responses
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (currentStep === 0) {
    return (
      <View style={styles.exerciseContainer}>
        <MaterialCommunityIcons name={currentStepData.icon} size={80} color={currentStepData.color} />
        <Title style={styles.exerciseTitle}>{currentStepData.title}</Title>
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
        <Text style={styles.instructions}>{currentStepData.description}</Text>
        <Button 
          mode="contained" 
          onPress={handleNext}
          style={styles.startButton}
          buttonColor={currentStepData.color}
        >
          Begin Exercise
        </Button>
      </View>
    );
  }

  if (currentStep === steps.length - 1) {
    return (
      <View style={styles.exerciseContainer}>
        <MaterialCommunityIcons name={currentStepData.icon} size={80} color={currentStepData.color} />
        <Title style={styles.exerciseTitle}>{currentStepData.title}</Title>
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
        <Text style={styles.instructions}>{currentStepData.description}</Text>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Your Grounding Journey:</Text>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="eye" size={20} color="#3B82F6" />
              <Text style={styles.summaryText}>5 things you saw</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="ear-hearing" size={20} color="#10B981" />
              <Text style={styles.summaryText}>4 things you heard</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="hand-back-right" size={20} color="#F59E0B" />
              <Text style={styles.summaryText}>3 things you felt</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="flower" size={20} color="#EC4899" />
              <Text style={styles.summaryText}>2 things you smelled</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="food-apple" size={20} color="#EF4444" />
              <Text style={styles.summaryText}>1 thing you tasted</Text>
            </View>
          </Card.Content>
        </Card>
        
        <Button 
          mode="contained" 
          onPress={handleNext}
          style={styles.startButton}
          buttonColor={currentStepData.color}
        >
          Complete Exercise
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.scrollContainer}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Step {currentStep} of {steps.length - 2}</Text>
      </View>
      
      <ScrollView 
        style={styles.contentScroll}
        contentContainerStyle={styles.exerciseContainer}
        showsVerticalScrollIndicator={false}
      >
        <MaterialCommunityIcons name={currentStepData.icon} size={48} color={currentStepData.color} />
        <Title style={styles.exerciseTitle}>{currentStepData.title}</Title>
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>
        
        <View style={styles.inputsContainer}>
          {Array.from({ length: currentStepData.count }).map((_, index) => (
            <TextInput
              key={index}
              mode="outlined"
              label={`${index + 1}.`}
              value={responses[currentStepData.key][index]}
              onChangeText={(value) => handleInputChange(currentStepData.key, index, value)}
              style={styles.input}
              placeholder="Type here..."
              outlineColor={currentStepData.color}
              activeOutlineColor={currentStepData.color}
              dense
            />
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.buttonRow}>
        <Button 
          mode="outlined" 
          onPress={handleBack}
          style={styles.navButton}
        >
          Back
        </Button>
        <Button 
          mode="contained" 
          onPress={handleNext}
          style={styles.navButton}
          buttonColor={currentStepData.color}
          disabled={!canProceed()}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  exerciseContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  instructions: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginVertical: spacing.md,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.xs,
    color: colors.subtext,
    marginVertical: spacing.sm,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
  startButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  progressContainer: {
    width: '100%',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.subtext,
    textAlign: 'center',
  },
  inputsContainer: {
    width: '100%',
    marginTop: spacing.sm,
  },
  input: {
    marginBottom: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    width: '100%',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.accent3,
  },
  navButton: {
    flex: 1,
  },
  summaryCard: {
    width: '100%',
    marginVertical: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  summaryText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
});

export default MindfulPauseExercise;
