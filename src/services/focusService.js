import { db } from '../config/firebase.client';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, limit as firestoreLimit } from 'firebase/firestore';

// Focus Service for managing user focus sessions and productivity tracking
export const focusService = {
  // Create a new focus session
  async createFocusSession(userId, sessionData) {
    try {
      const {
        sessionType,
        plannedDuration,
        actualDuration,
        completed,
        notes
      } = sessionData;

      const sessionRef = await addDoc(collection(db, 'focus_sessions'), {
        user_id: userId,
        session_type: sessionType,
        planned_duration_minutes: plannedDuration,
        actual_duration_minutes: actualDuration,
        completed: completed,
        notes: notes || '',
        started_at: new Date().toISOString(),
        completed_at: completed ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      });

      return { data: { id: sessionRef.id }, error: null };
    } catch (error) {
      console.error('Error creating focus session:', error);
      return { data: null, error };
    }
  },

  // Update focus session (when completed)
  async updateFocusSession(sessionId, updates) {
    try {
      const sessionRef = doc(db, 'focus_sessions', sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });

      const sessionSnap = await getDoc(sessionRef);
      return { data: { id: sessionSnap.id, ...sessionSnap.data() }, error: null };
    } catch (error) {
      console.error('Error updating focus session:', error);
      return { data: null, error };
    }
  },

  // Get user's focus sessions
  async getUserFocusSessions(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'focus_sessions'),
        where('user_id', '==', userId),
        orderBy('started_at', 'desc'),
        firestoreLimit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data: sessions, error: null };
    } catch (error) {
      console.error('Error fetching focus sessions:', error);
      return { data: [], error };
    }
  },

  // Get focus statistics
  async getFocusStats(userId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, 'focus_sessions'),
        where('user_id', '==', userId),
        where('started_at', '>=', startDate.toISOString()),
        where('started_at', '<=', endDate.toISOString())
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());

      const stats = {
        totalSessions: data.length,
        completedSessions: data.filter(session => session.completed).length,
        completionRate: data.length > 0 ? (data.filter(session => session.completed).length / data.length) * 100 : 0,
        totalFocusMinutes: data.filter(session => session.completed).reduce((sum, session) => sum + (session.actual_duration_minutes || 0), 0),
        averageSessionLength: 0,
        sessionTypeBreakdown: {},
        dailyStats: {}
      };

      // Calculate average session length
      const completedSessions = data.filter(session => session.completed && session.actual_duration_minutes);
      if (completedSessions.length > 0) {
        stats.averageSessionLength = completedSessions.reduce((sum, session) => sum + session.actual_duration_minutes, 0) / completedSessions.length;
      }

      // Calculate session type breakdown
      data.forEach(session => {
        if (!stats.sessionTypeBreakdown[session.session_type]) {
          stats.sessionTypeBreakdown[session.session_type] = {
            total: 0,
            completed: 0,
            totalMinutes: 0
          };
        }
        stats.sessionTypeBreakdown[session.session_type].total++;
        if (session.completed) {
          stats.sessionTypeBreakdown[session.session_type].completed++;
          stats.sessionTypeBreakdown[session.session_type].totalMinutes += session.actual_duration_minutes || 0;
        }
      });

      // Calculate daily stats
      data.forEach(session => {
        const date = new Date(session.started_at).toISOString().split('T')[0];
        if (!stats.dailyStats[date]) {
          stats.dailyStats[date] = {
            sessions: 0,
            completedSessions: 0,
            totalMinutes: 0
          };
        }
        stats.dailyStats[date].sessions++;
        if (session.completed) {
          stats.dailyStats[date].completedSessions++;
          stats.dailyStats[date].totalMinutes += session.actual_duration_minutes || 0;
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching focus stats:', error);
      return { data: null, error };
    }
  },

  // Get today's focus sessions
  async getTodaysFocusSessions(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const q = query(
        collection(db, 'focus_sessions'),
        where('user_id', '==', userId),
        where('started_at', '>=', `${today}T00:00:00.000Z`),
        where('started_at', '<', `${today}T23:59:59.999Z`),
        orderBy('started_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data: sessions, error: null };
    } catch (error) {
      console.error('Error fetching today\'s focus sessions:', error);
      return { data: [], error };
    }
  },

  // Get focus streaks and achievements
  async getFocusAchievements(userId) {
    try {
      const q = query(
        collection(db, 'focus_sessions'),
        where('user_id', '==', userId),
        where('completed', '==', true),
        orderBy('started_at', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());

      const achievements = {
        currentStreak: 0,
        longestStreak: 0,
        totalCompletedSessions: data.length,
        streakDates: []
      };

      if (data.length === 0) {
        return { data: achievements, error: null };
      }

      // Calculate streaks by checking consecutive days with completed sessions
      const sessionDates = [...new Set(data.map(session => 
        new Date(session.started_at).toISOString().split('T')[0]
      ))].sort();

      let currentStreak = 0;
      let longestStreak = 0;
      let lastDate = null;

      for (const dateStr of sessionDates) {
        const currentDate = new Date(dateStr);
        
        if (lastDate) {
          const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            currentStreak++;
          } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        
        lastDate = currentDate;
      }

      achievements.currentStreak = currentStreak;
      achievements.longestStreak = Math.max(longestStreak, currentStreak);
      achievements.streakDates = sessionDates;

      return { data: achievements, error: null };
    } catch (error) {
      console.error('Error fetching focus achievements:', error);
      return { data: null, error };
    }
  }
};

export default focusService;
