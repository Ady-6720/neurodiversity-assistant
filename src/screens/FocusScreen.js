import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  ProgressBar,
  Chip,
  FAB,
  Portal,
  Modal,
  TextInput,
  ActivityIndicator,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { focusService } from '../services/focusService';

const FocusScreen = () => {
  const { user } = useAuth();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionType, setSessionType] = useState('pomodoro');
  const [modalVisible, setModalVisible] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [focusStats, setFocusStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadFocusStats();
  }, [user]);

  // Load focus statistics
  const loadFocusStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await focusService.getFocusStats(user.id, 7); // Last 7 days
      if (error) {
        console.error('Error loading focus stats:', error);
      } else {
        setFocusStats(data);
      }
    } catch (error) {
      console.error('Error loading focus stats:', error);
    }
  };

  const sessionTypes = [
    { key: 'pomodoro', label: 'Pomodoro', duration: 25 },
    { key: 'short_break', label: 'Short Break', duration: 5 },
    { key: 'long_break', label: 'Long Break', duration: 15 },
    { key: 'deep_work', label: 'Deep Work', duration: 90 }
  ];

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      completeSession();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startTimer = async () => {
    if (!user) {
      setSnackbarMessage('Please log in to track focus sessions');
      setSnackbarVisible(true);
      return;
    }

    setIsTimerRunning(true);
    setSessionStartTime(new Date());
    
    // Create session in backend
    try {
      const selectedSession = sessionTypes.find(s => s.key === sessionType);
      const sessionData = {
        sessionType: sessionType,
        plannedDuration: selectedSession.duration,
        actualDuration: 0,
        completed: false,
        notes: sessionNote
      };
      
      const { data, error } = await focusService.createFocusSession(user.id, sessionData);
      if (error) {
        console.error('Error creating focus session:', error);
      } else {
        setCurrentSessionId(data.id);
      }
    } catch (error) {
      console.error('Error creating focus session:', error);
    }
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    const selectedSession = sessionTypes.find(s => s.key === sessionType);
    setTimeLeft(selectedSession.duration * 60);
    setCurrentSessionId(null);
    setSessionStartTime(null);
  };

  const completeSession = async () => {
    if (!currentSessionId || !sessionStartTime) return;
    
    try {
      const actualDuration = Math.round((new Date() - sessionStartTime) / (1000 * 60)); // minutes
      const updates = {
        actual_duration_minutes: actualDuration,
        completed: true,
        completed_at: new Date().toISOString(),
        notes: sessionNote
      };
      
      const { error } = await focusService.updateFocusSession(currentSessionId, updates);
      if (error) {
        console.error('Error completing focus session:', error);
      } else {
        setSnackbarMessage('Focus session completed successfully!');
        setSnackbarVisible(true);
        loadFocusStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error completing focus session:', error);
    }
    
    setCurrentSessionId(null);
    setSessionStartTime(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = (type) => {
    setSessionType(type.key);
    setTimeLeft(type.duration * 60);
    setIsTimerRunning(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Title style={styles.title}>Focus Sessions</Title>
        <Paragraph style={styles.subtitle}>
          Stay focused and productive with timed sessions
        </Paragraph>

        {/* Timer Display */}
        <Card style={styles.timerCard}>
          <Card.Content>
            <Title style={styles.timerText}>{formatTime(timeLeft)}</Title>
            <Paragraph style={styles.sessionType}>
              {sessionTypes.find(type => type.key === sessionType)?.label}
            </Paragraph>
            <ProgressBar 
              progress={1 - (timeLeft / (sessionTypes.find(type => type.key === sessionType)?.duration * 60))}
              color={colors.primary}
              style={styles.progressBar}
            />
          </Card.Content>
          <Card.Actions>
            {!isTimerRunning ? (
              <Button mode="contained" onPress={startTimer}>
                Start
              </Button>
            ) : (
              <Button mode="outlined" onPress={pauseTimer}>
                Pause
              </Button>
            )}
            <Button mode="outlined" onPress={resetTimer}>
              Reset
            </Button>
          </Card.Actions>
        </Card>

        {/* Session Types */}
        <Title style={styles.sectionTitle}>Session Types</Title>
        <View style={styles.chipContainer}>
          {sessionTypes.map((type) => (
            <Chip
              key={type.key}
              selected={sessionType === type.key}
              onPress={() => startSession(type)}
              style={styles.chip}
              selectedColor={colors.primary}
            >
              {type.label} ({type.duration}m)
            </Chip>
          ))}
        </View>

        {/* Focus Tips */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Title style={styles.tipsTitle}>Focus Tips</Title>
            <Paragraph style={styles.tip}>
              • Find a quiet, comfortable environment
            </Paragraph>
            <Paragraph style={styles.tip}>
              • Put your phone on silent mode
            </Paragraph>
            <Paragraph style={styles.tip}>
              • Take short breaks between sessions
            </Paragraph>
            <Paragraph style={styles.tip}>
              • Stay hydrated and take deep breaths
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Add Session Note</Title>
          <TextInput
            value={sessionNote}
            onChangeText={setSessionNote}
            placeholder="How was your focus session?"
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={() => {
              // TODO: Save session note
              setModalVisible(false);
              setSessionNote('');
            }}>
              Save Note
            </Button>
          </View>
        </Modal>
      </Portal>
      
      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    marginBottom: spacing.lg,
  },
  timerCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  timerText: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    color: colors.primary,
  },
  sessionType: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.subtext,
  },
  progressBar: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  chip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipsCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  tipsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tip: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    marginBottom: spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
  },
  modalContent: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  input: {
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  snackbar: {
    backgroundColor: colors.surface,
  },
});

export default FocusScreen;