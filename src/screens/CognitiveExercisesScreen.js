import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Portal, 
  Modal,
  IconButton,
  Text,
  Chip,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { cognitiveService } from '../services/cognitiveService';
import {
  ColorTapExercise,
  NumberOrderExercise,
  BigButtonExercise,
  ThisOrThatExercise,
  OddOneOutExercise,
  BreatheTimerExercise,
  DailyChecklistExercise,
  MoodCheckExercise
} from '../components/cognitive';

const CognitiveExercisesScreen = ({ route, navigation }) => {
  const { sectionId, section, exercises } = route.params;
  const { user } = useAuth();
  
  console.log('CognitiveExercisesScreen rendered with:', { sectionId, section, exercises });
  
  // Fallback if route params are missing
  if (!sectionId || !section || !exercises) {
    console.error('Missing route params:', { sectionId, section, exercises });
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: Missing section data</Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }
  
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseState, setExerciseState] = useState({});

  const showExerciseDetails = (exercise) => {
    console.log('Showing exercise details:', exercise);
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const startExercise = (exercise) => {
    console.log('Starting exercise:', exercise);
    // Navigate to full-screen exercise instead of modal
    navigation.navigate('FullScreenExercise', {
      exercise: exercise,
      sectionId: sectionId,
      sectionName: section.title,
      onComplete: (score, totalQuestions, duration) => {
        // This will be handled by the full-screen exercise component
        console.log('Exercise completed:', { score, totalQuestions, duration });
      }
    });
    setModalVisible(false);
  };

  const completeExercise = async (finalScore, totalQuestions) => {
    const endTime = new Date();
    const duration = (endTime - exerciseState.startTime) / 1000; // seconds
    
    // Track exercise completion
    const exerciseData = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.title,
      exerciseType: currentExercise.type,
      sectionId: sectionId,
      sectionName: section.title,
      score: finalScore,
      totalQuestions: totalQuestions,
      durationSeconds: Math.round(duration),
      notes: `Completed ${currentExercise.title} exercise`
    };
    
    console.log('Exercise completed:', exerciseData);
    
    // Save to backend
    if (user) {
      try {
        const { data, error } = await cognitiveService.trackExerciseCompletion(user.id, exerciseData);
        if (error) {
          console.error('Error saving exercise:', error);
        } else {
          console.log('Exercise saved successfully:', data);
        }
      } catch (error) {
        console.error('Error tracking exercise:', error);
      }
    }
    
    Alert.alert(
      'Exercise Complete!',
      `You scored ${finalScore}/${totalQuestions} in ${Math.round(duration)} seconds.`,
      [
        { text: 'OK', onPress: () => setExerciseModalVisible(false) }
      ]
    );
  };

  const renderExerciseModal = () => {
    if (!currentExercise) return null;

    switch (currentExercise.type) {
      case 'color-tap':
        return <ColorTapExercise exercise={currentExercise} onComplete={completeExercise} />;
      case 'number-order':
        return <NumberOrderExercise exercise={currentExercise} onComplete={completeExercise} />;
      case 'big-button':
        return <BigButtonExercise exercise={currentExercise} onComplete={completeExercise} />;
      case 'this-or-that':
        return <ThisOrThatExercise exercise={currentExercise} onComplete={completeExercise} />;
      case 'odd-one-out':
        return <OddOneOutExercise exercise={currentExercise} onComplete={completeExercise} />;
      case 'breathe-timer':
        return <BreatheTimerExercise exercise={currentExercise} onComplete={completeExercise} />;
      case 'daily-checklist':
        return <DailyChecklistExercise exercise={currentExercise} onComplete={completeExercise} />;
      case 'mood-check':
        return <MoodCheckExercise exercise={currentExercise} onComplete={completeExercise} />;
      default:
        return (
          <View style={styles.exerciseContainer}>
            <Title style={styles.exerciseTitle}>{currentExercise.title}</Title>
            <Text style={styles.exerciseSubtitle}>Test Exercise</Text>
            <Button 
              mode="contained" 
              onPress={() => completeExercise(3, 5)}
              style={{ marginTop: 20 }}
            >
              Complete Exercise (3/5)
            </Button>
          </View>
        );
    }
  };

  console.log('Rendering CognitiveExercisesScreen with exercises:', exercises);
  
  // Add a simple test to see if the screen is rendering at all
  if (!exercises || exercises.length === 0) {
    console.log('No exercises found, showing fallback');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Title style={styles.headerTitle}>Test Screen</Title>
        </View>
        <View style={styles.content}>
          <Text>No exercises found. Debug info:</Text>
          <Text>Section ID: {sectionId}</Text>
          <Text>Section: {section?.title}</Text>
          <Text>Exercises count: {exercises?.length || 0}</Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Exercises List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.exercisesList}>
          {exercises && exercises.length > 0 ? (
            exercises.map((exercise, index) => (
              <Card
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => showExerciseDetails(exercise)}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.exerciseHeader}>
                    <View style={[styles.exerciseIcon, { backgroundColor: exercise.color }]}>
                      <MaterialCommunityIcons 
                        name={exercise.icon} 
                        size={24} 
                        color={colors.surface}
                      />
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Title style={styles.exerciseTitle}>
                        {exercise.title}
                      </Title>
                      <Text style={styles.exerciseDescription}>
                        {exercise.description}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.exerciseMetadata}>
                    <Chip 
                      icon="clock-outline" 
                      style={styles.metadataChip}
                      textStyle={styles.chipText}
                    >
                      {exercise.duration}
                    </Chip>
                    <Chip 
                      icon="stairs" 
                      style={styles.metadataChip}
                      textStyle={styles.chipText}
                    >
                      {exercise.difficulty}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.errorText}>No exercises found for this section</Text>
              <Button mode="contained" onPress={() => navigation.goBack()}>
                Go Back
              </Button>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Exercise Details Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          {selectedExercise && (
            <View style={styles.modalContent}>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              />
              
              <View style={[styles.modalIconContainer, { backgroundColor: selectedExercise.color }]}>
                <MaterialCommunityIcons 
                  name={selectedExercise.icon} 
                  size={48} 
                  color={colors.surface}
                />
              </View>
              
              <Title style={styles.modalTitle}>
                {selectedExercise.title}
              </Title>
              
              <Paragraph style={styles.modalDescription}>
                {selectedExercise.description}
              </Paragraph>
              
              <View style={styles.benefitsSection}>
                <Title style={styles.benefitsTitle}>Benefits</Title>
                {selectedExercise.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <MaterialCommunityIcons 
                      name="check-circle" 
                      size={20} 
                      color={selectedExercise.color}
                    />
                    <Text style={styles.benefitText}>
                      {benefit}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalMetadata}>
                <View style={styles.metadataItem}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={20} 
                    color={colors.subtext}
                  />
                  <Text style={styles.metadataItemText}>
                    {selectedExercise.duration}
                  </Text>
                </View>
                <View style={styles.metadataItem}>
                  <MaterialCommunityIcons 
                    name="stairs" 
                    size={20} 
                    color={colors.subtext}
                  />
                  <Text style={styles.metadataItemText}>
                    {selectedExercise.difficulty}
                  </Text>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={() => startExercise(selectedExercise)}
                style={[styles.startButton, { backgroundColor: selectedExercise.color }]}
              >
                Start Exercise
              </Button>
            </View>
          )}
        </Modal>
      </Portal>

      {/* Exercise Modal */}
      <Portal>
        <Modal
          visible={exerciseModalVisible}
          onDismiss={() => setExerciseModalVisible(false)}
          contentContainerStyle={styles.exerciseModal}
        >
          {renderExerciseModal()}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    lineHeight: 20,
  },
  headerDescription: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    lineHeight: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  exercisesList: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    elevation: 2,
  },
  cardContent: {
    padding: spacing.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  exerciseDescription: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    lineHeight: 20,
  },
  exerciseMetadata: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metadataChip: {
    backgroundColor: colors.background,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
  },
  modal: {
    margin: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    maxHeight: '85%',
  },
  modalContent: {
    padding: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    zIndex: 1,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    lineHeight: 22,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  benefitsSection: {
    marginBottom: spacing.lg,
  },
  benefitsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  modalMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataItemText: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    marginLeft: spacing.xs,
  },
  startButton: {
    paddingVertical: spacing.sm,
  },
  exerciseModal: {
    margin: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    maxHeight: '90%',
  },
  exerciseContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.error,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
});

export default CognitiveExercisesScreen; 