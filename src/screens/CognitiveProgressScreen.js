import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
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

const CognitiveProgressScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load progress summary
      const { data: summary, error: summaryError } = await cognitiveService.getProgressSummary(user.id);
      if (summaryError) {
        console.error('Error loading progress summary:', summaryError);
      }

      // Load exercise history
      const { data: history, error: historyError } = await cognitiveService.getExerciseHistory(user.id, 10);
      if (historyError) {
        console.error('Error loading exercise history:', historyError);
      }

      // Load recommendations
      const { data: recommendations, error: recError } = await cognitiveService.getRecommendedExercises(user.id);
      if (recError) {
        console.error('Error loading recommendations:', recError);
      }

      setProgressData({
        summary: summary?.data || {},
        history: history?.data || [],
        recommendations: recommendations?.data || {}
      });
    } catch (error) {
      console.error('Error loading progress data:', error);
      // Set default data to prevent infinite loading
      setProgressData({
        summary: { totalExercises: 0, averageAccuracy: 0, streakDays: 0, totalTimeSpent: 0 },
        history: [],
        recommendations: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, setting default data');
        setLoading(false);
        setProgressData({
          summary: { totalExercises: 0, averageAccuracy: 0, streakDays: 0, totalTimeSpent: 0 },
          history: [],
          recommendations: {}
        });
      }
    }, 5000); // 5 second timeout

    loadProgressData();

    return () => clearTimeout(timeoutId);
  }, [user]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getPerformanceColor = (accuracy) => {
    if (accuracy >= 90) return colors.success;
    if (accuracy >= 80) return colors.primary;
    if (accuracy >= 70) return colors.warning;
    return colors.error;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.subtext;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no data
  if (!progressData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="brain" size={64} color={colors.subtext} />
          <Title style={styles.emptyTitle}>No Progress Data</Title>
          <Text style={styles.emptyText}>
            Complete some cognitive exercises to see your progress here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Stats */}
        {progressData?.summary && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Overall Progress</Title>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{progressData.summary.totalExercises}</Text>
                  <Text style={styles.statLabel}>Total Exercises</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{Math.round(progressData.summary.averageAccuracy || 0)}%</Text>
                  <Text style={styles.statLabel}>Avg Accuracy</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{progressData.summary.streakDays}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatDuration(progressData.summary.totalTimeSpent || 0)}</Text>
                  <Text style={styles.statLabel}>Total Time</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Recommendations */}
        {progressData?.recommendations && (
          <Card style={styles.recommendationsCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Recommended Focus Areas</Title>
              
              {Object.entries(progressData.recommendations).map(([sectionId, recommendation]) => (
                <View key={sectionId} style={styles.recommendationItem}>
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.recommendationSection}>
                      {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
                    </Text>
                    <Chip 
                      mode="outlined"
                      style={[styles.priorityChip, { borderColor: getPriorityColor(recommendation.priority) }]}
                      textStyle={{ color: getPriorityColor(recommendation.priority) }}
                    >
                      {recommendation.priority.toUpperCase()}
                    </Chip>
                  </View>
                  <Text style={styles.recommendationReason}>{recommendation.reason}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Recent Activity */}
        {progressData?.history && progressData.history.length > 0 && (
          <Card style={styles.historyCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Recent Activity</Title>
              
              {progressData.history.slice(0, 5).map((exercise, index) => (
                <View key={exercise.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                    <Text style={styles.exerciseDate}>{formatDate(exercise.created_at)}</Text>
                  </View>
                  
                  <View style={styles.historyStats}>
                    <Chip 
                      icon="target" 
                      style={styles.accuracyChip}
                      textStyle={{ color: getPerformanceColor(exercise.accuracy_percentage) }}
                    >
                      {Math.round(exercise.accuracy_percentage)}% accuracy
                    </Chip>
                    
                    <Chip 
                      icon="clock-outline" 
                      style={styles.durationChip}
                    >
                      {formatDuration(exercise.duration_seconds)}
                    </Chip>
                    
                    <Chip 
                      icon="star" 
                      style={styles.scoreChip}
                    >
                      {exercise.score}/{exercise.total_questions}
                    </Chip>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Empty State */}
        {(!progressData?.summary || progressData.summary.totalExercises === 0) && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons 
                name="brain" 
                size={64} 
                color={colors.subtext}
              />
              <Title style={styles.emptyTitle}>No exercises completed yet</Title>
              <Text style={styles.emptyText}>
                Start your cognitive training journey by completing some exercises!
              </Text>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Cognitive')}
                style={styles.startButton}
              >
                Start Training
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.lg,
    color: colors.subtext,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
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
  },
  summaryCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  recommendationsCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  historyCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    marginTop: spacing.xl,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    textAlign: 'center',
  },
  recommendationItem: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recommendationSection: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  priorityChip: {
    backgroundColor: 'transparent',
  },
  recommendationReason: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    lineHeight: 18,
  },
  historyItem: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exerciseName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  exerciseDate: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
  },
  historyStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  accuracyChip: {
    backgroundColor: 'transparent',
  },
  durationChip: {
    backgroundColor: 'transparent',
  },
  scoreChip: {
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  startButton: {
    paddingHorizontal: spacing.lg,
  },
});

export default CognitiveProgressScreen; 