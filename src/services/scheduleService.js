import { supabase } from '../config/supabase';

// Schedule Service for managing user schedules and activities
export const scheduleService = {
  // Create a new schedule item
  async createScheduleItem(userId, scheduleData) {
    try {
      const {
        title,
        time,
        duration,
        type,
        icon,
        notes,
        visualSupport,
        reminder,
        date
      } = scheduleData;

      const { data, error } = await supabase
        .from('schedules')
        .insert({
          user_id: userId,
          title,
          scheduled_time: time,
          duration_minutes: parseInt(duration),
          activity_type: type,
          icon,
          notes: notes || '',
          visual_support: visualSupport,
          reminder_enabled: reminder,
          scheduled_date: date,
          completed: false,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error creating schedule item:', error);
      return { data: null, error };
    }
  },

  // Get user's schedule for a specific date
  async getScheduleByDate(userId, date) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('scheduled_date', date)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return { data: [], error };
    }
  },

  // Get user's schedule for a date range
  async getScheduleByDateRange(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching schedule range:', error);
      return { data: [], error };
    }
  },

  // Update schedule item
  async updateScheduleItem(scheduleId, updates) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId)
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error updating schedule item:', error);
      return { data: null, error };
    }
  },

  // Mark schedule item as completed
  async completeScheduleItem(scheduleId) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId)
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error completing schedule item:', error);
      return { data: null, error };
    }
  },

  // Delete schedule item
  async deleteScheduleItem(scheduleId) {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      return { error };
    }
  },

  // Get schedule statistics
  async getScheduleStats(userId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('schedules')
        .select('completed, activity_type, duration_minutes')
        .eq('user_id', userId)
        .gte('scheduled_date', startDate.toISOString().split('T')[0])
        .lte('scheduled_date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      const stats = {
        totalScheduled: data.length,
        totalCompleted: data.filter(item => item.completed).length,
        completionRate: data.length > 0 ? (data.filter(item => item.completed).length / data.length) * 100 : 0,
        totalMinutes: data.filter(item => item.completed).reduce((sum, item) => sum + (item.duration_minutes || 0), 0),
        activityBreakdown: {}
      };

      // Calculate activity type breakdown
      data.forEach(item => {
        if (!stats.activityBreakdown[item.activity_type]) {
          stats.activityBreakdown[item.activity_type] = {
            total: 0,
            completed: 0,
            minutes: 0
          };
        }
        stats.activityBreakdown[item.activity_type].total++;
        if (item.completed) {
          stats.activityBreakdown[item.activity_type].completed++;
          stats.activityBreakdown[item.activity_type].minutes += item.duration_minutes || 0;
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching schedule stats:', error);
      return { data: null, error };
    }
  }
};

export default scheduleService;
