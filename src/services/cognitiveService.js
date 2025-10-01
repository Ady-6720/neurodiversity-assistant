import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit
} from 'firebase/firestore';

// Cognitive Exercise Service
export const cognitiveService = {
  // Track exercise completion
  async trackExerciseCompletion(userId, exerciseData) {
    try {
      const {
        exerciseId,
        exerciseName,
        exerciseType,
        sectionId,
        sectionName,
        score,
        totalQuestions,
        durationSeconds,
        notes = ''
      } = exerciseData;

      // Calculate accuracy percentage
      const accuracyPercentage = totalQuestions > 0 
        ? (score / totalQuestions) * 100 
        : 0;

      // Determine performance rating based on accuracy
      let performanceRating = 1;
      if (accuracyPercentage >= 90) performanceRating = 5;
      else if (accuracyPercentage >= 80) performanceRating = 4;
      else if (accuracyPercentage >= 70) performanceRating = 3;
      else if (accuracyPercentage >= 60) performanceRating = 2;

      const exerciseRef = await addDoc(collection(db, 'cognitive_exercises'), {
        user_id: userId,
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        exercise_type: exerciseType,
        section_id: sectionId,
        section_name: sectionName,
        completed: true,
        score: score,
        total_questions: totalQuestions,
        duration_seconds: durationSeconds,
        accuracy_percentage: accuracyPercentage,
        performance_rating: performanceRating,
        notes: notes,
        created_at: new Date().toISOString()
      });

      return { data: { id: exerciseRef.id }, error: null };
    } catch (error) {
      console.error('Error tracking exercise completion:', error);
      return { data: null, error };
    }
  },

  // Get user's exercise history
  async getExerciseHistory(userId, limitCount = 20) {
    try {
      const q = query(
        collection(db, 'cognitive_exercises'),
        where('user_id', '==', userId),
        where('completed', '==', true),
        orderBy('created_at', 'desc'),
        firestoreLimit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const exercises = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('getExerciseHistory - Found', exercises.length, 'exercises for user', userId);
      return { data: exercises, error: null };
    } catch (error) {
      console.error('Error fetching exercise history:', error);
      return { data: null, error };
    }
  },

  // Get exercise statistics by section
  async getExerciseStats(userId, sectionId = null) {
    try {
      let q;
      if (sectionId) {
        q = query(
          collection(db, 'cognitive_exercises'),
          where('user_id', '==', userId),
          where('completed', '==', true),
          where('section_id', '==', sectionId)
        );
      } else {
        q = query(
          collection(db, 'cognitive_exercises'),
          where('user_id', '==', userId),
          where('completed', '==', true)
        );
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());

      // Calculate statistics
      const stats = {
        totalExercises: data?.length || 0,
        averageScore: 0,
        averageAccuracy: 0,
        averageDuration: 0,
        bestPerformance: null,
        recentTrend: 'stable'
      };

      if (data && data.length > 0) {
        const totalScore = data.reduce((sum, exercise) => sum + exercise.score, 0);
        const totalAccuracy = data.reduce((sum, exercise) => sum + exercise.accuracy_percentage, 0);
        const totalDuration = data.reduce((sum, exercise) => sum + exercise.duration_seconds, 0);

        stats.averageScore = totalScore / data.length;
        stats.averageAccuracy = totalAccuracy / data.length;
        stats.averageDuration = totalDuration / data.length;

        // Find best performance
        const bestExercise = data.reduce((best, current) => 
          current.accuracy_percentage > best.accuracy_percentage ? current : best
        );
        stats.bestPerformance = bestExercise;

        // Calculate recent trend (last 5 exercises)
        const recentExercises = data.slice(0, 5);
        if (recentExercises.length >= 2) {
          const recentAvg = recentExercises.reduce((sum, ex) => sum + ex.accuracy_percentage, 0) / recentExercises.length;
          const olderExercises = data.slice(5, 10);
          if (olderExercises.length > 0) {
            const olderAvg = olderExercises.reduce((sum, ex) => sum + ex.accuracy_percentage, 0) / olderExercises.length;
            if (recentAvg > olderAvg + 5) stats.recentTrend = 'improving';
            else if (recentAvg < olderAvg - 5) stats.recentTrend = 'declining';
          }
        }
      }

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching exercise statistics:', error);
      return { data: null, error };
    }
  },

  // Get exercise performance by type
  async getExerciseTypeStats(userId, exerciseType) {
    try {
      const q = query(
        collection(db, 'cognitive_exercises'),
        where('user_id', '==', userId),
        where('exercise_type', '==', exerciseType),
        where('completed', '==', true),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());

      const stats = {
        totalAttempts: data?.length || 0,
        averageAccuracy: 0,
        bestScore: 0,
        averageDuration: 0,
        improvementRate: 0
      };

      if (data && data.length > 0) {
        const totalAccuracy = data.reduce((sum, exercise) => sum + exercise.accuracy_percentage, 0);
        const totalDuration = data.reduce((sum, exercise) => sum + exercise.duration_seconds, 0);
        const bestScore = Math.max(...data.map(ex => ex.score));

        stats.averageAccuracy = totalAccuracy / data.length;
        stats.averageDuration = totalDuration / data.length;
        stats.bestScore = bestScore;

        // Calculate improvement rate (comparing first 3 vs last 3 attempts)
        if (data.length >= 6) {
          const recentAvg = data.slice(0, 3).reduce((sum, ex) => sum + ex.accuracy_percentage, 0) / 3;
          const olderAvg = data.slice(-3).reduce((sum, ex) => sum + ex.accuracy_percentage, 0) / 3;
          stats.improvementRate = recentAvg - olderAvg;
        }
      }

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching exercise type statistics:', error);
      return { data: null, error };
    }
  },

  // Get user's progress summary
  async getProgressSummary(userId) {
    try {
      const q = query(
        collection(db, 'cognitive_exercises'),
        where('user_id', '==', userId),
        where('completed', '==', true),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());

      console.log('Progress Summary - Total exercises found:', data.length);
      if (data.length > 0) {
        console.log('Sample exercise data:', data[0]);
      }

      const summary = {
        totalExercises: data?.length || 0,
        sectionsCompleted: new Set(),
        exerciseTypesCompleted: new Set(),
        totalTimeSpent: 0,
        averageAccuracy: 0,
        streakDays: 0,
        completedToday: 0,
        targetDaily: 5,
        lastExerciseDate: null
      };

      if (data && data.length > 0) {
        // Calculate section and type completion
        data.forEach(exercise => {
          summary.sectionsCompleted.add(exercise.section_id);
          summary.exerciseTypesCompleted.add(exercise.exercise_type);
          summary.totalTimeSpent += exercise.duration_seconds;
        });

        // Calculate average accuracy
        const totalAccuracy = data.reduce((sum, exercise) => {
          const accuracy = exercise.accuracy_percentage || 0;
          return sum + accuracy;
        }, 0);
        summary.averageAccuracy = data.length > 0 ? Math.round(totalAccuracy / data.length) : 0;

        // Calculate exercises completed today
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        summary.completedToday = data.filter(exercise => {
          const exerciseDate = new Date(exercise.created_at);
          return exerciseDate >= todayStart;
        }).length;

        // Calculate streak days
        let currentStreak = 0;
        let currentDate = today;

        for (let i = 0; i < 30; i++) { // Check last 30 days
          const exercisesOnDate = data.filter(exercise => {
            const exerciseDate = new Date(exercise.created_at);
            return exerciseDate.toDateString() === currentDate.toDateString();
          });

          if (exercisesOnDate.length > 0) {
            currentStreak++;
            currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
          } else {
            break;
          }
        }
        summary.streakDays = currentStreak;

        // Get last exercise date
        if (data.length > 0) {
          summary.lastExerciseDate = new Date(data[0].created_at);
        }

        // Convert sets to arrays for JSON serialization
        summary.sectionsCompleted = Array.from(summary.sectionsCompleted);
        summary.exerciseTypesCompleted = Array.from(summary.exerciseTypesCompleted);
      }

      return { data: summary, error: null };
    } catch (error) {
      console.error('Error fetching progress summary:', error);
      return { data: null, error };
    }
  },

  // Get recommended exercises based on performance
  async getRecommendedExercises(userId) {
    try {
      const { data: history, error } = await this.getExerciseHistory(userId, 50);
      
      if (error) throw error;

      const recommendations = {
        focus: { priority: 'medium', reason: 'Balanced performance' },
        organization: { priority: 'medium', reason: 'Balanced performance' },
        impulse: { priority: 'medium', reason: 'Balanced performance' },
        memory: { priority: 'medium', reason: 'Balanced performance' }
      };

      if (history && history.length > 0) {
        // Analyze performance by section
        const sectionStats = {};
        history.forEach(exercise => {
          if (!sectionStats[exercise.section_id]) {
            sectionStats[exercise.section_id] = {
              total: 0,
              totalAccuracy: 0,
              recentAccuracy: 0,
              recentCount: 0
            };
          }
          
          sectionStats[exercise.section_id].total++;
          sectionStats[exercise.section_id].totalAccuracy += exercise.accuracy_percentage;
          
          // Check if exercise is from last 7 days
          const exerciseDate = new Date(exercise.created_at);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          if (exerciseDate > weekAgo) {
            sectionStats[exercise.section_id].recentAccuracy += exercise.accuracy_percentage;
            sectionStats[exercise.section_id].recentCount++;
          }
        });

        // Determine recommendations based on performance
        Object.keys(sectionStats).forEach(sectionId => {
          const stats = sectionStats[sectionId];
          const avgAccuracy = stats.totalAccuracy / stats.total;
          const recentAvg = stats.recentCount > 0 ? stats.recentAccuracy / stats.recentCount : avgAccuracy;

          if (avgAccuracy < 70 || recentAvg < 65) {
            recommendations[sectionId] = { 
              priority: 'high', 
              reason: 'Low performance - needs practice' 
            };
          } else if (avgAccuracy > 85 && recentAvg > 80) {
            recommendations[sectionId] = { 
              priority: 'low', 
              reason: 'Excellent performance - can try advanced exercises' 
            };
          } else if (stats.total < 3) {
            recommendations[sectionId] = { 
              priority: 'high', 
              reason: 'Not enough practice - needs more exercises' 
            };
          }
        });
      }

      return { data: recommendations, error: null };
    } catch (error) {
      console.error('Error getting recommended exercises:', error);
      return { data: null, error };
    }
  },

  // Get exercise analytics for charts
  async getExerciseAnalytics(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, 'cognitive_exercises'),
        where('user_id', '==', userId),
        where('completed', '==', true),
        where('created_at', '>=', startDate.toISOString()),
        orderBy('created_at', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());

      const analytics = {
        dailyProgress: [],
        sectionPerformance: {},
        exerciseTypePerformance: {},
        accuracyTrend: []
      };

      if (data && data.length > 0) {
        // Group by date
        const dailyStats = {};
        data.forEach(exercise => {
          const date = new Date(exercise.created_at).toDateString();
          if (!dailyStats[date]) {
            dailyStats[date] = {
              exercises: 0,
              totalAccuracy: 0,
              totalDuration: 0
            };
          }
          dailyStats[date].exercises++;
          dailyStats[date].totalAccuracy += exercise.accuracy_percentage;
          dailyStats[date].totalDuration += exercise.duration_seconds;
        });

        // Convert to array format for charts
        analytics.dailyProgress = Object.keys(dailyStats).map(date => ({
          date,
          exercises: dailyStats[date].exercises,
          averageAccuracy: dailyStats[date].totalAccuracy / dailyStats[date].exercises,
          totalDuration: dailyStats[date].totalDuration
        }));

        // Section performance
        const sectionStats = {};
        data.forEach(exercise => {
          if (!sectionStats[exercise.section_id]) {
            sectionStats[exercise.section_id] = {
              total: 0,
              totalAccuracy: 0,
              totalDuration: 0
            };
          }
          sectionStats[exercise.section_id].total++;
          sectionStats[exercise.section_id].totalAccuracy += exercise.accuracy_percentage;
          sectionStats[exercise.section_id].totalDuration += exercise.duration_seconds;
        });

        Object.keys(sectionStats).forEach(sectionId => {
          const stats = sectionStats[sectionId];
          analytics.sectionPerformance[sectionId] = {
            totalExercises: stats.total,
            averageAccuracy: stats.totalAccuracy / stats.total,
            averageDuration: stats.totalDuration / stats.total
          };
        });

        // Exercise type performance
        const typeStats = {};
        data.forEach(exercise => {
          if (!typeStats[exercise.exercise_type]) {
            typeStats[exercise.exercise_type] = {
              total: 0,
              totalAccuracy: 0,
              totalDuration: 0
            };
          }
          typeStats[exercise.exercise_type].total++;
          typeStats[exercise.exercise_type].totalAccuracy += exercise.accuracy_percentage;
          typeStats[exercise.exercise_type].totalDuration += exercise.duration_seconds;
        });

        Object.keys(typeStats).forEach(type => {
          const stats = typeStats[type];
          analytics.exerciseTypePerformance[type] = {
            totalExercises: stats.total,
            averageAccuracy: stats.totalAccuracy / stats.total,
            averageDuration: stats.totalDuration / stats.total
          };
        });

        // Accuracy trend (last 10 exercises)
        const recentExercises = data.slice(-10);
        analytics.accuracyTrend = recentExercises.map((exercise, index) => ({
          index: index + 1,
          accuracy: exercise.accuracy_percentage,
          exercise: exercise.exercise_name
        }));
      }

      return { data: analytics, error: null };
    } catch (error) {
      console.error('Error fetching exercise analytics:', error);
      return { data: null, error };
    }
  }
};

export default cognitiveService;
