import { supabase } from '../config/supabase';

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

      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: userId,
          session_type: sessionType,
          planned_duration_minutes: plannedDuration,
          actual_duration_minutes: actualDuration,
          completed: completed,
          notes: notes || '',
          started_at: new Date().toISOString(),
          completed_at: completed ? new Date().toISOString() : null,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error creating focus session:', error);
      return { data: null, error };
    }
  },

  // Update focus session (when completed)
  async updateFocusSession(sessionId, updates) {
    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error updating focus session:', error);
      return { data: null, error };
    }
  },

  // Get user's focus sessions
  async getUserFocusSessions(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
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

      const { data, error } = await supabase
        .from('focus_sessions')
        .select('session_type, planned_duration_minutes, actual_duration_minutes, completed, started_at')
        .eq('user_id', userId)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      if (error) throw error;

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
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('started_at', `${today}T00:00:00.000Z`)
        .lt('started_at', `${today}T23:59:59.999Z`)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching today\'s focus sessions:', error);
      return { data: [], error };
    }
  },

  // Get focus streaks and achievements
  async getFocusAchievements(userId) {
    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('started_at, completed')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('started_at', { ascending: true });

      if (error) throw error;

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
