// src/screens/FullScreenExerciseScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, BackHandler, ScrollView } from 'react-native';
import { 
  IconButton, 
  Text, 
  Button,
  Portal,
  Dialog,
  Paragraph
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { cognitiveService } from '../services/cognitiveService';

// Import exercise components
import {
  SimpleTestExercise,
  NumberOrderExercise,
  BigButtonExercise,
  ThisOrThatExercise,
  OddOneOutExercise,
  BreatheTimerExercise,
  DailyChecklistExercise,
  MoodCheckExercise,
  EnhancedColorTapExercise
} from '../components/cognitive';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FullScreenExerciseScreen = ({ route, navigation }) => {
  const { exercise, sectionId, sectionName } = route.params;
  const { user } = useAuth();
  
  console.log('FullScreenExerciseScreen mounted with params:', route.params);
  console.log('Exercise data:', exercise);
  
  const [exerciseState, setExerciseState] = useState({
    startTime: new Date(),
    score: 0,
    totalQuestions: 0,
    completed: false,
    paused: false
  });
  
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowExitDialog(true);
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    StatusBar.setHidden(true);
    return () => StatusBar.setHidden(false);
  }, []);

  const handleExerciseComplete = async (finalScore, totalQuestions, extraData = {}) => {
    const endTime = Date.now();
    const duration = Math.round((endTime - exerciseState.startTime) / 1000); // seconds
    
    const exerciseData = {
      exerciseId: exercise.id,
      exerciseName: exercise.title,
      exerciseType: exercise.type,
      sectionId: sectionId,
      sectionName: sectionName,
      score: finalScore,
      totalQuestions: totalQuestions,
      durationSeconds: duration,
      accuracy: totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0,
      notes: `Completed ${exercise.title} exercise`,
      ...extraData
    };
    
    console.log('Exercise completed:', exerciseData);
    
    // Load best score for this exercise
    let bestScore = null;
    if (user) {
      try {
        const { data: stats } = await cognitiveService.getExerciseStats(user.uid, exercise.type);
        bestScore = stats;
        
        // Save current completion
        const { data, error } = await cognitiveService.trackExerciseCompletion(user.uid, exerciseData);
        if (error) {
          console.error('Error saving exercise:', error);
        } else {
          console.log('Exercise saved successfully:', data);
        }
      } catch (error) {
        console.error('Error loading best score:', error);
      }
    }
    
    setCompletionData({
      score: finalScore,
      totalQuestions: totalQuestions,
      duration: duration,
      accuracy: exerciseData.accuracy,
      exerciseType: exercise.type,
      bestScore: bestScore,
      ...extraData
    });
    setShowCompletionDialog(true);
  };

  const handleExit = () => {
    StatusBar.setHidden(false);
    navigation.goBack();
  };

  const handleContinueAfterCompletion = () => {
    setShowCompletionDialog(false);
    StatusBar.setHidden(false);
    navigation.goBack();
  };

  const renderExercise = () => {
    console.log('Rendering exercise with type:', exercise.type);
    console.log('Exercise data:', exercise);
    
    const exerciseProps = {
      exercise: exercise,
      onComplete: handleExerciseComplete,
      fullScreen: true,
      screenWidth: screenWidth,
      screenHeight: screenHeight
    };

    try {
      switch (exercise.type) {
        case 'color-tap':
          console.log('Rendering EnhancedColorTapExercise for type:', exercise.type);
          return <EnhancedColorTapExercise {...exerciseProps} />;
        case 'number-order':
          console.log('Rendering NumberOrderExercise for type:', exercise.type);
          return <NumberOrderExercise {...exerciseProps} />;
        case 'big-button':
          console.log('Rendering BigButtonExercise for type:', exercise.type);
          return <BigButtonExercise {...exerciseProps} />;
        case 'this-or-that':
          console.log('Rendering ThisOrThatExercise for type:', exercise.type);
          return <ThisOrThatExercise {...exerciseProps} />;
        case 'odd-one-out':
          console.log('Rendering OddOneOutExercise for type:', exercise.type);
          return <OddOneOutExercise {...exerciseProps} />;
        case 'breathe-timer':
          console.log('Rendering BreatheTimerExercise for type:', exercise.type);
          return <BreatheTimerExercise {...exerciseProps} />;
        case 'daily-checklist':
          console.log('Rendering DailyChecklistExercise for type:', exercise.type);
          return <DailyChecklistExercise {...exerciseProps} />;
        case 'mood-check':
          console.log('Rendering MoodCheckExercise for type:', exercise.type);
          return <MoodCheckExercise {...exerciseProps} />;
        default:
          console.log('Rendering default exercise for type:', exercise.type);
          return (
            <View style={styles.defaultExerciseContainer}>
              <MaterialCommunityIcons 
                name={exercise.icon || 'brain'} 
                size={80} 
                color={colors.primary} 
                style={styles.exerciseIcon}
              />
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              <Text style={styles.exerciseSubtitle}>Demo Exercise</Text>
              <View style={styles.demoButtons}>
                <Button 
                  mode="contained" 
                  onPress={() => handleExerciseComplete(3, 5)}
                  style={styles.completeButton}
                  contentStyle={styles.completeButtonContent}
                >
                  Complete (3/5)
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => handleExerciseComplete(5, 5)}
                  style={styles.completeButton}
                  contentStyle={styles.completeButtonContent}
                >
                  Perfect Score (5/5)
                </Button>
              </View>
            </View>
          );
      }
    } catch (error) {
      console.error('Error rendering exercise:', error);
      return (
        <View style={styles.defaultExerciseContainer}>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={80} 
            color={colors.error} 
            style={styles.exerciseIcon}
          />
          <Text style={styles.exerciseTitle}>Exercise Error</Text>
          <Text style={styles.exerciseDescription}>
            There was an error loading the exercise. Please try again.
          </Text>
          <Button 
            mode="contained" 
            onPress={() => handleExerciseComplete(0, 5)}
            style={styles.completeButton}
            contentStyle={styles.completeButtonContent}
          >
            Skip Exercise
          </Button>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Exercise Header with Exit Button */}
      <View style={styles.exerciseHeader}>
        <IconButton
          icon="close"
          size={28}
          onPress={() => setShowExitDialog(true)}
          iconColor={colors.surface}
          style={styles.exitButton}
        />
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseTitle}>{exercise?.title || 'Exercise'}</Text>
          <Text style={styles.sectionName}>{sectionName || 'Cognitive Training'}</Text>
        </View>
      </View>
      
      {/* Full Screen Exercise Content */}
      <ScrollView 
        style={styles.exerciseContent}
        contentContainerStyle={styles.exerciseContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {exercise ? (
          renderExercise()
        ) : (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons 
              name="alert-circle" 
              size={64} 
              color={colors.error} 
            />
            <Text style={styles.errorTitle}>Exercise Not Found</Text>
            <Text style={styles.errorText}>
              The exercise "{exercise?.title || 'Unknown'}" could not be loaded.
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              Go Back
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Exit Confirmation Dialog */}
      <Portal>
        <Dialog visible={showExitDialog} onDismiss={() => setShowExitDialog(false)}>
          <Dialog.Title>Exit Exercise?</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to exit this exercise? Your progress will not be saved.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowExitDialog(false)}>Cancel</Button>
            <Button onPress={handleExit}>Exit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Completion Dialog */}
      <Portal>
        <Dialog visible={showCompletionDialog} onDismiss={() => {}}>
          <Dialog.Title>🎉 Exercise Complete!</Dialog.Title>
          <Dialog.Content>
            {completionData && (
              <View style={styles.completionStats}>
                <Text style={styles.completionTitle}>Great job!</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Score:</Text>
                  <Text style={styles.statValue}>
                    {completionData.score}/{completionData.totalQuestions}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Accuracy:</Text>
                  <Text style={styles.statValue}>{completionData.accuracy}%</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Time:</Text>
                  <Text style={styles.statValue}>
                    {Math.floor(completionData.duration / 60)}m {completionData.duration % 60}s
                  </Text>
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              mode="contained" 
              onPress={handleContinueAfterCompletion}
              style={styles.continueButton}
            >
              Continue
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  exitButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: 0,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  exerciseTitle: {
    ...typography.headlineSmall,
    color: colors.surface,
    fontWeight: 'bold',
  },
  sectionName: {
    ...typography.bodySmall,
    color: colors.surface,
    opacity: 0.8,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseContentContainer: {
    flexGrow: 1,
    padding: spacing.md,
  },
  defaultExerciseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  exerciseIcon: {
    marginBottom: spacing.lg,
  },
  exerciseDescription: {
    ...typography.bodyLarge,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  completeButton: {
    marginTop: spacing.lg,
  },
  completeButtonContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  exerciseSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  demoButtons: {
    gap: spacing.md,
    width: '100%',
  },
  completionStats: {
    paddingVertical: spacing.md,
  },
  completionTitle: {
    ...typography.headlineSmall,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  statLabel: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '500',
  },
  statValue: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: 'bold',
  },
  continueButton: {
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  exitButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: spacing.sm,
  },
});

export default FullScreenExerciseScreen;

