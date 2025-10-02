import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Text, Avatar, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.client';

const LeaderboardScreen = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('all'); // all, week, month

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Get all user profiles with their stats
      const profilesQuery = query(
        collection(db, 'user_profiles'),
        orderBy('total_exercises_completed', 'desc'),
        limit(50)
      );
      
      const profilesSnapshot = await getDocs(profilesQuery);
      const profiles = profilesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate scores for each user
      const leaderboardData = await Promise.all(
        profiles.map(async (profile) => {
          const exercisesQuery = query(
            collection(db, 'cognitive_exercises'),
            orderBy('created_at', 'desc'),
            limit(100)
          );
          
          const exercisesSnapshot = await getDocs(exercisesQuery);
          const exercises = exercisesSnapshot.docs
            .map(doc => doc.data())
            .filter(ex => ex.user_id === profile.id && ex.completed);

          const totalExercises = exercises.length;
          const avgAccuracy = exercises.length > 0
            ? Math.round(exercises.reduce((sum, ex) => sum + (ex.accuracy_percentage || 0), 0) / exercises.length)
            : 0;
          const totalPoints = totalExercises * 10 + avgAccuracy;

          return {
            userId: profile.id,
            displayName: profile.display_name || 'Anonymous',
            totalExercises,
            avgAccuracy,
            totalPoints,
            isCurrentUser: profile.id === user?.uid
          };
        })
      );

      // Sort by total points
      leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return { icon: 'trophy', color: '#FFD700' }; // Gold
    if (rank === 2) return { icon: 'trophy', color: '#C0C0C0' }; // Silver
    if (rank === 3) return { icon: 'trophy', color: '#CD7F32' }; // Bronze
    return { icon: 'account', color: colors.subtext };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>🏆 Leaderboard</Title>
        <Text style={styles.subtitle}>Top performers this {timeframe === 'all' ? 'all time' : timeframe}</Text>
      </View>

      {/* Timeframe filters */}
      <View style={styles.filterContainer}>
        <Chip
          selected={timeframe === 'all'}
          onPress={() => setTimeframe('all')}
          style={styles.filterChip}
        >
          All Time
        </Chip>
        <Chip
          selected={timeframe === 'week'}
          onPress={() => setTimeframe('week')}
          style={styles.filterChip}
        >
          This Week
        </Chip>
        <Chip
          selected={timeframe === 'month'}
          onPress={() => setTimeframe('month')}
          style={styles.filterChip}
        >
          This Month
        </Chip>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {leaderboard.map((entry, index) => {
          const rank = index + 1;
          const medal = getMedalIcon(rank);
          
          return (
            <Card
              key={entry.userId}
              style={[
                styles.leaderboardCard,
                entry.isCurrentUser && styles.currentUserCard
              ]}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.rankContainer}>
                  <MaterialCommunityIcons
                    name={medal.icon}
                    size={32}
                    color={medal.color}
                  />
                  <Text style={styles.rankText}>#{rank}</Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {entry.displayName}
                    {entry.isCurrentUser && ' (You)'}
                  </Text>
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary} />
                      <Text style={styles.statText}>{entry.totalExercises} exercises</Text>
                    </View>
                    <View style={styles.stat}>
                      <MaterialCommunityIcons name="target" size={16} color={colors.secondary} />
                      <Text style={styles.statText}>{entry.avgAccuracy}% accuracy</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.pointsContainer}>
                  <Text style={styles.pointsValue}>{entry.totalPoints}</Text>
                  <Text style={styles.pointsLabel}>pts</Text>
                </View>
              </Card.Content>
            </Card>
          );
        })}

        {leaderboard.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="trophy-outline" size={64} color={colors.subtext} />
            <Text style={styles.emptyText}>No data yet</Text>
            <Text style={styles.emptySubtext}>Complete exercises to appear on the leaderboard!</Text>
          </View>
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
    marginTop: spacing.md,
    color: colors.subtext,
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  leaderboardCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rankContainer: {
    alignItems: 'center',
    width: 60,
  },
  rankText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  pointsLabel: {
    fontSize: typography.sizes.xs,
    color: colors.subtext,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default LeaderboardScreen;
