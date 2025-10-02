import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Title, Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { cognitiveService } from '../services/cognitiveService';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: summary } = await cognitiveService.getProgressSummary(user.uid);
      const { data: analytics } = await cognitiveService.getAnalytics(user.uid, 30);
      
      setStats({
        ...summary,
        ...analytics
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Title style={styles.title}>📊 Your Dashboard</Title>
          <Text style={styles.subtitle}>Track your progress and achievements</Text>
        </View>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="check-all" size={32} color={colors.primary} />
              <Text style={styles.statValue}>{stats?.totalExercises || 0}</Text>
              <Text style={styles.statLabel}>Total Exercises</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="target" size={32} color={colors.secondary} />
              <Text style={styles.statValue}>{Math.round(stats?.averageAccuracy || 0)}%</Text>
              <Text style={styles.statLabel}>Avg Accuracy</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="fire" size={32} color="#F59E0B" />
              <Text style={styles.statValue}>{stats?.streakDays || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="clock-outline" size={32} color={colors.tertiary} />
              <Text style={styles.statValue}>{Math.floor((stats?.totalTimeSpent || 0) / 60)}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Today's Progress */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-today" size={24} color={colors.primary} />
              <Title style={styles.cardTitle}>Today's Progress</Title>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(100, (stats?.completedToday || 0) / (stats?.targetDaily || 5) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {stats?.completedToday || 0} / {stats?.targetDaily || 5} exercises completed
            </Text>
          </Card.Content>
        </Card>

        {/* Exercise Breakdown */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="chart-pie" size={24} color={colors.primary} />
              <Title style={styles.cardTitle}>Exercise Breakdown</Title>
            </View>
            
            {stats?.exerciseTypesCompleted?.length > 0 ? (
              stats.exerciseTypesCompleted.map((type, index) => (
                <View key={index} style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>{type}</Text>
                  <View style={styles.breakdownBar}>
                    <View style={[styles.breakdownFill, { width: '70%' }]} />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No exercises completed yet</Text>
            )}
          </Card.Content>
        </Card>

        {/* Achievements */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
              <Title style={styles.cardTitle}>Achievements</Title>
            </View>
            
            <View style={styles.achievementsGrid}>
              <View style={[styles.achievement, stats?.totalExercises >= 10 && styles.achievementUnlocked]}>
                <MaterialCommunityIcons 
                  name="medal" 
                  size={32} 
                  color={stats?.totalExercises >= 10 ? '#FFD700' : colors.subtext} 
                />
                <Text style={styles.achievementText}>First 10</Text>
              </View>

              <View style={[styles.achievement, stats?.streakDays >= 7 && styles.achievementUnlocked]}>
                <MaterialCommunityIcons 
                  name="fire" 
                  size={32} 
                  color={stats?.streakDays >= 7 ? '#F59E0B' : colors.subtext} 
                />
                <Text style={styles.achievementText}>7 Day Streak</Text>
              </View>

              <View style={[styles.achievement, stats?.averageAccuracy >= 90 && styles.achievementUnlocked]}>
                <MaterialCommunityIcons 
                  name="star" 
                  size={32} 
                  color={stats?.averageAccuracy >= 90 ? '#FFD700' : colors.subtext} 
                />
                <Text style={styles.achievementText}>90% Accuracy</Text>
              </View>

              <View style={[styles.achievement, stats?.totalExercises >= 50 && styles.achievementUnlocked]}>
                <MaterialCommunityIcons 
                  name="trophy-variant" 
                  size={32} 
                  color={stats?.totalExercises >= 50 ? '#FFD700' : colors.subtext} 
                />
                <Text style={styles.achievementText}>50 Exercises</Text>
              </View>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.subtext,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.surface,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginTop: spacing.xs,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.accent3,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    textAlign: 'center',
  },
  breakdownItem: {
    marginBottom: spacing.md,
  },
  breakdownLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  breakdownBar: {
    height: 8,
    backgroundColor: colors.accent3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: colors.secondary,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievement: {
    width: (width - spacing.lg * 2 - spacing.md * 3) / 4,
    aspectRatio: 1,
    backgroundColor: colors.accent3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  achievementUnlocked: {
    backgroundColor: colors.highlight,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  achievementText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default DashboardScreen;
