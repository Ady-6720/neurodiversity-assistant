import { supabase } from '../config/supabase';

// Task Service for managing user tasks and to-do items
export const taskService = {
  // Create a new task
  async createTask(userId, taskData) {
    try {
      const {
        title,
        description,
        priority,
        category,
        dueDate,
        estimatedMinutes
      } = taskData;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title,
          description: description || '',
          priority: priority || 'medium',
          category: category || 'general',
          due_date: dueDate,
          estimated_minutes: estimatedMinutes,
          completed: false,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error };
    }
  },

  // Get all tasks for a user
  async getUserTasks(userId, filter = 'all') {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filter === 'completed') {
        query = query.eq('completed', true);
      } else if (filter === 'incomplete') {
        query = query.eq('completed', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { data: [], error };
    }
  },

  // Update task
  async updateTask(taskId, updates) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error updating task:', error);
      return { data: null, error };
    }
  },

  // Toggle task completion
  async toggleTaskCompletion(taskId, completed) {
    try {
      const updates = {
        completed,
        updated_at: new Date().toISOString()
      };

      if (completed) {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return { data: null, error };
    }
  },

  // Delete task
  async deleteTask(taskId) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { error };
    }
  },

  // Get task statistics
  async getTaskStats(userId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('tasks')
        .select('completed, priority, category, estimated_minutes, completed_at, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = {
        totalTasks: data.length,
        completedTasks: data.filter(task => task.completed).length,
        incompleteTasks: data.filter(task => !task.completed).length,
        completionRate: data.length > 0 ? (data.filter(task => task.completed).length / data.length) * 100 : 0,
        totalEstimatedMinutes: data.reduce((sum, task) => sum + (task.estimated_minutes || 0), 0),
        completedMinutes: data.filter(task => task.completed).reduce((sum, task) => sum + (task.estimated_minutes || 0), 0),
        priorityBreakdown: {
          high: data.filter(task => task.priority === 'high').length,
          medium: data.filter(task => task.priority === 'medium').length,
          low: data.filter(task => task.priority === 'low').length
        },
        categoryBreakdown: {}
      };

      // Calculate category breakdown
      data.forEach(task => {
        const category = task.category || 'general';
        if (!stats.categoryBreakdown[category]) {
          stats.categoryBreakdown[category] = {
            total: 0,
            completed: 0
          };
        }
        stats.categoryBreakdown[category].total++;
        if (task.completed) {
          stats.categoryBreakdown[category].completed++;
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      return { data: null, error };
    }
  },

  // Get today's tasks
  async getTodaysTasks(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .or(`due_date.eq.${today},created_at.gte.${today}T00:00:00.000Z`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching today\'s tasks:', error);
      return { data: [], error };
    }
  },

  // Get overdue tasks
  async getOverdueTasks(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .lt('due_date', today)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      return { data: [], error };
    }
  }
};

export default taskService;
