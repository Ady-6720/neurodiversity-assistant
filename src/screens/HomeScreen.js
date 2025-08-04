// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  IconButton,
  Chip,
  ProgressBar,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography, shapes } from '../config/theme';
import { cognitiveService } from '../services/cognitiveService';

const HomeScreen = ({ navigation }) => {
  const { user, profile, signOut, loading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progressData, setProgressData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Load real user data from backend
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoadingStats(true);
        
        // Load progress summary
        const { data: summary, error: summaryError } = await cognitiveService.getProgressSummary(user.id);
        if (summaryError) {
          console.error('Error loading progress summary:', summaryError);
        }
        
        // Load recent exercise history
        const { data: history, error: historyError } = await cognitiveService.getExerciseHistory(user.id, 5);
        if (historyError) {
          console.error('Error loading exercise history:', historyError);
        }
        
        // Set progress data
        setProgressData(summary?.data || {
          totalExercises: 0,
          averageAccuracy: 0,
          streakDays: 0,
          totalTimeSpent: 0,
          completedToday: 0,
          targetDaily: 5
        });
        
        // Format recent activity
        const formattedActivity = (history?.data || []).map(exercise => ({
          id: exercise.id,
          title: `Completed ${exercise.exercise_name}`,
          time: formatTimeAgo(exercise.created_at),
          icon: getExerciseIcon(exercise.exercise_type),
          color: getExerciseColor(exercise.exercise_type)
        }));
        
        setRecentActivity(formattedActivity);
        
      } catch (error) {
        console.error('Error loading user data:', error);
        // Set default data on error
        setProgressData({
          totalExercises: 0,
          averageAccuracy: 0,
          streakDays: 0,
          totalTimeSpent: 0,
          completedToday: 0,
          targetDaily: 5
        });
        setRecentActivity([]);
      } finally {
        setLoadingStats(false);
      }
    };
    
    loadUserData();
  }, [user]);

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.success) {
      console.error('Sign out failed:', result.error);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const exerciseDate = new Date(dateString);
    const diffInHours = Math.floor((now - exerciseDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return exerciseDate.toLocaleDateString();
  };

  const getExerciseIcon = (exerciseType) => {
    switch (exerciseType) {
      case 'color-tap': return 'check-circle';
      case 'number-order': return 'numeric';
      case 'focus': return 'target';
      case 'memory': return 'brain';
      default: return 'check-circle';
    }
  };

  const getExerciseColor = (exerciseType) => {
    switch (exerciseType) {
      case 'color-tap': return colors.success;
      case 'number-order': return colors.primary;
      case 'focus': return colors.accent1;
      case 'memory': return colors.secondary;
      default: return colors.primary;
    }
  };

  const quickActions = [
    {
      id: 'tasks',
      title: 'Tasks',
      subtitle: 'Manage your daily tasks',
      icon: 'format-list-checks',
      color: colors.primary,
      onPress: () => navigation.navigate('Tasks')
    },
    {
      id: 'cognitive',
      title: 'Cognitive',
      subtitle: 'Brain training exercises',
      icon: 'brain',
      color: colors.secondary,
      onPress: () => navigation.navigate('Cognitive')
    },
    {
      id: 'sensory',
      title: 'Sensory',
      subtitle: 'Calming sensory tools',
      icon: 'palette',
      color: colors.tertiary,
      onPress: () => navigation.navigate('Sensory')
    },
    {
      id: 'focus',
      title: 'Focus',
      subtitle: 'Concentration tools',
      icon: 'target',
      color: colors.accent1,
      onPress: () => navigation.navigate('Focus')
    }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Title style={styles.nameText}>
              {profile?.display_name || user?.email?.split('@')[0] || 'User'}
            </Title>
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
          </View>
          
          <IconButton
            icon="account-circle"
            size={40}
            iconColor={colors.primary}
            onPress={handleSignOut}
            style={styles.profileButton}
          />
        </View>

        {/* Progress Overview */}
        <Card style={styles.progressCard}>
          <Card.Content>
            {loadingStats ? (
              <View style={styles.loadingStats}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading your progress...</Text>
              </View>
            ) : (
              <>
                <View style={styles.progressHeader}>
                  <Title style={styles.progressTitle}>Your Progress</Title>
                  <Chip 
                    icon="fire" 
                    style={styles.streakChip}
                    textStyle={styles.streakText}
                  >
                    {progressData?.streakDays || 0} day streak
                  </Chip>
                </View>
                
                <View style={styles.progressStats}>
                  <Text style={styles.progressLabel}>
                    {progressData?.completedToday || 0} of {progressData?.targetDaily || 5} daily exercises completed
                  </Text>
                  <ProgressBar 
                    progress={(progressData?.completedToday || 0) / (progressData?.targetDaily || 5)}
                    color={colors.primary}
                    style={styles.progressBar}
                  />
                </View>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{progressData?.totalExercises || 0}</Text>
                    <Text style={styles.statLabel}>Total Exercises</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Math.round(progressData?.averageAccuracy || 0)}%</Text>
                    <Text style={styles.statLabel}>Avg Accuracy</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Math.floor((progressData?.totalTimeSpent || 0) / 60)}m</Text>
                    <Text style={styles.statLabel}>Total Time</Text>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <Card 
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <Card.Content style={styles.actionContent}>
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <MaterialCommunityIcons 
                      name={action.icon} 
                      size={28} 
                      color={colors.surface}
                    />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <Card style={styles.recentCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Recent Activity</Title>
            
            {loadingStats ? (
              <View style={styles.loadingStats}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading recent activity...</Text>
              </View>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <MaterialCommunityIcons 
                    name={activity.icon} 
                    size={24} 
                    color={activity.color}
                  />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <MaterialCommunityIcons 
                  name="brain" 
                  size={48} 
                  color={colors.subtext}
                />
                <Text style={styles.emptyActivityText}>No recent activity</Text>
                <Text style={styles.emptyActivitySubtext}>Start an exercise to see your progress here!</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  welcomeSection: {
    flex: 1,
  },
  greetingText: {
    ...typography.bodyLarge,
    color: colors.subtext,
    marginBottom: spacing.xs,
  },
  nameText: {
    ...typography.headlineLarge,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateText: {
    ...typography.bodyMedium,
    color: colors.subtext,
  },
  profileButton: {
    backgroundColor: colors.accent3,
  },
  progressCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.headlineSmall,
    color: colors.text,
  },
  streakChip: {
    backgroundColor: colors.accent1,
  },
  streakText: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  progressStats: {
    marginTop: spacing.sm,
  },
  progressLabel: {
    ...typography.bodyMedium,
    color: colors.subtext,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  loadingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.subtext,
    marginLeft: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.accent3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.headlineSmall,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.subtext,
    marginTop: spacing.xs,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headlineSmall,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: spacing.md,
    elevation: 1,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.bodyLarge,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  actionSubtitle: {
    ...typography.bodySmall,
    color: colors.subtext,
    textAlign: 'center',
  },
  recentCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent3,
  },
  activityInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  activityTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  activityTime: {
    ...typography.bodySmall,
    color: colors.subtext,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyActivityText: {
    ...typography.bodyLarge,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptyActivitySubtext: {
    ...typography.bodySmall,
    color: colors.subtext,
    textAlign: 'center',
  },
});

export default HomeScreen;
