// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography } from '../config/theme';
import { cognitiveService } from '../services/cognitiveService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, profile, signOut, loading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progressData, setProgressData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoadingStats(true);
        
        const { data: summary, error: summaryError } = await cognitiveService.getProgressSummary(user.id);
        if (summaryError) {
          console.error('Error loading progress summary:', summaryError);
        }
        
        const { data: history, error: historyError } = await cognitiveService.getExerciseHistory(user.id, 5);
        if (historyError) {
          console.error('Error loading exercise history:', historyError);
        }
        
        setProgressData(summary || {
          totalExercises: 0,
          averageAccuracy: 0,
          streakDays: 0,
          totalTimeSpent: 0,
          completedToday: 0,
          targetDaily: 5
        });
        
        const formattedActivity = (history || []).map(exercise => ({
          id: exercise.id,
          title: exercise.exercise_name,
          time: formatTimeAgo(exercise.created_at),
          icon: getExerciseIcon(exercise.exercise_type),
          score: exercise.accuracy_percentage
        }));
        
        setRecentActivity(formattedActivity);
        
      } catch (error) {
        console.error('Error loading user data:', error);
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
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return exerciseDate.toLocaleDateString();
  };

  const getExerciseIcon = (exerciseType) => {
    switch (exerciseType) {
      case 'color-tap': return 'palette';
      case 'number-order': return 'numeric';
      case 'focus': return 'target';
      case 'memory': return 'brain';
      default: return 'check-circle';
    }
  };

  const getStreakColor = () => {
    const streak = progressData?.streakDays || 0;
    if (streak === 0) return '#94A3B8';
    if (streak < 3) return '#F59E0B';
    if (streak < 7) return '#10B981';
    return '#8B5CF6';
  };

  const getStreakEmoji = () => {
    const streak = progressData?.streakDays || 0;
    if (streak === 0) return '💤';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🔥🔥';
    return '🔥🔥🔥';
  };

  const quickActions = [
    {
      id: 'tasks',
      title: 'Tasks',
      subtitle: 'Track daily tasks quickly',
      icon: 'checkbox-marked-circle-outline',
      gradient: ['#3B82F6', '#2563EB'],
      bgColor: '#EFF6FF',
      onPress: () => navigation.navigate('Tasks')
    },
    {
      id: 'cognitive',
      title: 'Brain Games',
      subtitle: 'Boost memory & focus',
      icon: 'brain',
      gradient: ['#8B5CF6', '#7C3AED'],
      bgColor: '#F5F3FF',
      onPress: () => navigation.navigate('Cognitive')
    },
    {
      id: 'sensory',
      title: 'Calm',
      subtitle: 'Find sensory balance',
      icon: 'spa-outline',
      gradient: ['#EC4899', '#DB2777'],
      bgColor: '#FDF2F8',
      onPress: () => navigation.navigate('Sensory')
    },
    {
      id: 'focus',
      title: 'Focus',
      subtitle: 'Start a focus session',
      icon: 'timer-outline',
      gradient: ['#10B981', '#059669'],
      bgColor: '#ECFDF5',
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

  const progress = (progressData?.completedToday || 0) / (progressData?.targetDaily || 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Title style={styles.nameText}>
              {profile?.display_name || user?.email?.split('@')[0] || 'User'}
            </Title>
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
          </View>
          
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.profileButton}
            accessibilityLabel="Profile and settings"
          >
            <MaterialCommunityIcons 
              name="account-circle" 
              size={44} 
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Card - HERO SECTION */}
        <Card style={styles.progressCard} elevation={6}>
          <Card.Content style={styles.progressContent}>
            {loadingStats ? (
              <View style={styles.loadingStats}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading your progress...</Text>
              </View>
            ) : (
              <>
                {/* Streak Badge - Prominent */}
                <View style={[styles.streakBadge, { backgroundColor: getStreakColor() }]}>
                  <Text style={styles.streakEmoji}>{getStreakEmoji()}</Text>
                  <Text style={styles.streakNumber}>{progressData?.streakDays || 0}</Text>
                  <Text style={styles.streakLabel}>Day Streak</Text>
                </View>

                {/* Progress Ring/Bar */}
                <View style={styles.progressSection}>
                  <Text style={styles.progressTitle}>Today's Progress</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${Math.min(progress * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {progressData?.completedToday || 0}/{progressData?.targetDaily || 5} exercises
                    </Text>
                  </View>
                </View>
                
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <MaterialCommunityIcons name="check-all" size={20} color="#3B82F6" />
                    <Text style={styles.statValue}>{progressData?.totalExercises || 0}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>
                  <View style={styles.statBox}>
                    <MaterialCommunityIcons name="target" size={20} color="#10B981" />
                    <Text style={styles.statValue}>{Math.round(progressData?.averageAccuracy || 0)}%</Text>
                    <Text style={styles.statLabel}>Accuracy</Text>
                  </View>
                  <View style={styles.statBox}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#8B5CF6" />
                    <Text style={styles.statValue}>{Math.floor((progressData?.totalTimeSpent || 0) / 60)}m</Text>
                    <Text style={styles.statLabel}>Time</Text>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions - Grid */}
        <View style={styles.actionsSection}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id}
                style={[styles.actionCard, { backgroundColor: action.bgColor }]}
                onPress={action.onPress}
                activeOpacity={0.7}
                accessibilityLabel={`${action.title}: ${action.subtitle}`}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.gradient[0] }]}>
                  <MaterialCommunityIcons 
                    name={action.icon} 
                    size={28} 
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle} numberOfLines={2}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Title style={styles.sectionTitle}>Recent Activity</Title>
          
          {recentActivity.length === 0 ? (
            <Card style={styles.emptyActivityCard}>
              <Card.Content style={styles.emptyActivityContent}>
                <MaterialCommunityIcons 
                  name="rocket-launch-outline" 
                  size={48} 
                  color={colors.primary}
                />
                <Text style={styles.emptyActivityTitle}>Ready to start?</Text>
                <Text style={styles.emptyActivityText}>
                  Complete your first exercise to begin tracking your progress!
                </Text>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('Cognitive')}
                  style={styles.startButton}
                  labelStyle={styles.startButtonLabel}
                  icon="play-circle"
                >
                  Start First Exercise
                </Button>
              </Card.Content>
            </Card>
          ) : (
            recentActivity.map((activity) => (
              <Card key={activity.id} style={styles.activityCard}>
                <Card.Content style={styles.activityContent}>
                  <View style={styles.activityIcon}>
                    <MaterialCommunityIcons 
                      name={activity.icon} 
                      size={24} 
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  {activity.score && (
                    <View style={styles.activityScore}>
                      <Text style={styles.scoreText}>{Math.round(activity.score)}%</Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  welcomeSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: colors.subtext,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: colors.subtext,
  },
  profileButton: {
    marginTop: -4,
  },
  // Progress Card - HERO
  progressCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  progressContent: {
    padding: spacing.lg,
  },
  loadingStats: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.subtext,
  },
  streakBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: spacing.lg,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    gap: spacing.sm,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'center',
  },
  // Quick Actions - Grid
  actionsSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 140,
    marginBottom: spacing.md,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 11,
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 15,
  },
  // Recent Activity
  activitySection: {
    paddingHorizontal: spacing.lg,
  },
  emptyActivityCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  emptyActivityContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyActivityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyActivityText: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  startButton: {
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
  },
  startButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  activityCard: {
    marginBottom: spacing.md,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: colors.subtext,
  },
  activityScore: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default HomeScreen;
