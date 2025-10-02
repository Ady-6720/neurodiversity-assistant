import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

const CognitiveScreen = ({ navigation }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const sections = [
    {
      id: 'focus',
      title: 'Focus & Attention',
      subtitle: 'Build concentration and sustained attention skills',
      icon: 'target',
      color: colors.primary,
      exerciseCount: 3,
      description: 'Exercises to improve your ability to concentrate and maintain focus on tasks.'
    },
    {
      id: 'organization',
      title: 'Organization & Planning',
      subtitle: 'Develop better task management and planning abilities',
      icon: 'format-list-checks',
      color: colors.secondary,
      exerciseCount: 2,
      description: 'Learn to break down complex tasks and manage your time effectively.'
    },
    {
      id: 'impulse',
      title: 'Impulse Control',
      subtitle: 'Practice mindfulness and self-regulation techniques',
      icon: 'meditation',
      color: colors.tertiary,
      exerciseCount: 4,
      description: 'Build skills to pause, think, and choose responses mindfully.'
    },
    {
      id: 'memory',
      title: 'Memory & Processing',
      subtitle: 'Enhance memory retention and information processing',
      icon: 'brain',
      color: colors.accent1,
      exerciseCount: 2,
      description: 'Strengthen your memory and improve how you process information.'
    }
  ];

  const exercises = {
    focus: [
      {
        id: 'color-tap',
        title: 'Color Tap',
        description: 'Tap the matching color circle when you see the color name',
        duration: '2-3 mins',
        difficulty: 'Easy',
        icon: 'palette',
        color: colors.primary,
        type: 'color-tap',
        benefits: [
          'Improves visual attention',
          'Enhances color recognition',
          'Builds quick response skills'
        ]
      },
      {
        id: 'number-order',
        title: 'Number Order',
        description: 'Tap numbers 1-5 in the correct order',
        duration: '2-3 mins',
        difficulty: 'Easy',
        icon: 'numeric',
        color: colors.secondary,
        type: 'number-order',
        benefits: [
          'Strengthens sequential thinking',
          'Improves number recognition',
          'Builds memory skills'
        ]
      },
      {
        id: 'big-button',
        title: 'Big Button',
        description: 'Tap the button when it appears on screen',
        duration: '2-3 mins',
        difficulty: 'Easy',
        icon: 'gesture-tap',
        color: colors.tertiary,
        type: 'big-button',
        benefits: [
          'Improves reaction time',
          'Enhances attention',
          'Builds focus skills'
        ]
      }
    ],
    organization: [
      {
        id: 'this-or-that',
        title: 'This or That',
        description: 'Choose between two options based on the question',
        duration: '2-3 mins',
        difficulty: 'Easy',
        icon: 'help-circle',
        color: colors.tertiary,
        type: 'this-or-that',
        benefits: [
          'Improves decision making',
          'Enhances logical thinking',
          'Builds comparison skills'
        ]
      },
      {
        id: 'odd-one-out',
        title: 'Odd One Out',
        description: 'Find the item that doesn\'t belong with the others',
        duration: '2-3 mins',
        difficulty: 'Easy',
        icon: 'magnify',
        color: colors.accent1,
        type: 'odd-one-out',
        benefits: [
          'Enhances categorization',
          'Builds analytical thinking'
        ]
      }
    ],
    impulse: [
      {
        id: 'breathe-timer',
        title: 'Breathe Timer',
        description: 'Focus on breathing for 30 seconds',
        duration: '30 secs',
        difficulty: 'Easy',
        icon: 'meditation',
        color: colors.accent2,
        type: 'breathe-timer',
        benefits: [
          'Improves self-regulation',
          'Reduces stress',
          'Builds mindfulness'
        ]
      },
      {
        id: 'stop-think',
        title: 'Stop & Think',
        description: 'Wait for green light before tapping',
        duration: '2-3 mins',
        difficulty: 'Medium',
        icon: 'traffic-light',
        color: '#EF4444',
        type: 'stop-think',
        benefits: [
          'Teaches pause-before-action',
          'Builds impulse inhibition',
          'Improves self-control'
        ]
      },
      {
        id: 'wait-for-it',
        title: 'Wait For It',
        description: 'Resist tapping until timer says GO',
        duration: '2-3 mins',
        difficulty: 'Medium',
        icon: 'timer-sand',
        color: '#F59E0B',
        type: 'wait-for-it',
        benefits: [
          'Builds delayed gratification',
          'Improves patience',
          'Strengthens impulse resistance'
        ]
      },
      {
        id: 'mindful-pause',
        title: 'Mindful Pause',
        description: '5-4-3-2-1 grounding exercise',
        duration: '3-5 mins',
        difficulty: 'Easy',
        icon: 'hand-peace',
        color: '#8B5CF6',
        type: 'mindful-pause',
        benefits: [
          'Grounding technique',
          'Reduces anxiety',
          'Builds emotional regulation'
        ]
      }
    ],
    memory: [
      {
        id: 'daily-checklist',
        title: 'Daily Checklist',
        description: 'Check off 5 common daily tasks',
        duration: '1-2 mins',
        difficulty: 'Easy',
        icon: 'format-list-checks',
        color: colors.primary,
        type: 'daily-checklist',
        benefits: [
          'Improves task organization',
          'Enhances memory',
          'Builds planning skills'
        ]
      },
      {
        id: 'mood-check',
        title: 'Mood Check',
        description: 'Select how you\'re feeling right now',
        duration: '30 secs',
        difficulty: 'Easy',
        icon: 'emoticon',
        color: colors.secondary,
        type: 'mood-check',
        benefits: [
          'Improves self-awareness',
          'Enhances emotional recognition',
          'Builds mindfulness'
        ]
      }
    ]
  };

  const showExerciseDetails = (exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const navigateToSection = (sectionId) => {
    console.log('Navigating to section:', sectionId);
    console.log('Available sections:', sections);
    console.log('Available exercises:', exercises);
    
    const section = sections.find(s => s.id === sectionId);
    const sectionExercises = exercises[sectionId];
    
    console.log('Found section:', section);
    console.log('Found exercises:', sectionExercises);
    
    // Navigate to the exercise subscreen
    navigation.navigate('CognitiveExercises', { 
      sectionId, 
      section,
      exercises: sectionExercises
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sections Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionsGrid}>
          {sections.map((section) => (
            <Card
              key={section.id}
              style={styles.sectionCard}
              onPress={() => navigateToSection(section.id)}
            >
              <Card.Content style={styles.sectionCardContent}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: section.color }]}>
                    <MaterialCommunityIcons 
                      name={section.icon} 
                      size={28} 
                      color={colors.surface}
                    />
                  </View>
                  <View style={styles.sectionInfo}>
                    <Title style={styles.sectionTitle}>{section.title}</Title>
                    <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                  </View>
                </View>
                
                <Text style={styles.sectionDescription}>
                  {section.description}
                </Text>
                
                <View style={styles.sectionFooter}>
                  <Chip 
                    icon="dumbbell" 
                    style={styles.exerciseCountChip}
                    textStyle={styles.chipText}
                  >
                    {section.exerciseCount} exercises
                  </Chip>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={24} 
                    color={colors.subtext}
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
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
                onPress={() => {
                  setModalVisible(false);
                  // Navigation to exercise implementation would go here
                }}
                style={[styles.startButton, { backgroundColor: selectedExercise.color }]}
              >
                Start Exercise
              </Button>
            </View>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressButton: {
    margin: 0,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  sectionsGrid: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    elevation: 2,
    borderRadius: 16,
  },
  sectionCardContent: {
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.subtext,
    lineHeight: 18,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.subtext,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  sectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseCountChip: {
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
});

export default CognitiveScreen;
