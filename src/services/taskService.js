import { db } from '../config/firebase.client';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';

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

      const taskRef = await addDoc(collection(db, 'tasks'), {
        user_id: userId,
        title,
        description: description || '',
        priority: priority || 'medium',
        category: category || 'general',
        due_date: dueDate || null,
        estimated_minutes: estimatedMinutes || 0,
        completed: false,
        created_at: new Date().toISOString()
      });

      const taskSnap = await getDoc(taskRef);
      return { data: { id: taskSnap.id, ...taskSnap.data() }, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error };
    }
  },

  // Get all tasks for a user
  async getUserTasks(userId, filter = 'all') {
    try {
      let q = query(
        collection(db, 'tasks'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );

      if (filter === 'completed') {
        q = query(
          collection(db, 'tasks'),
          where('user_id', '==', userId),
          where('completed', '==', true),
          orderBy('created_at', 'desc')
        );
      } else if (filter === 'incomplete') {
        q = query(
          collection(db, 'tasks'),
          where('user_id', '==', userId),
          where('completed', '==', false),
          orderBy('created_at', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data: tasks, error: null };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { data: [], error };
    }
  },

  // Update task
  async updateTask(taskId, updates) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });

      const taskSnap = await getDoc(taskRef);
      return { data: { id: taskSnap.id, ...taskSnap.data() }, error: null };
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

      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, updates);

      const taskSnap = await getDoc(taskRef);
      return { data: { id: taskSnap.id, ...taskSnap.data() }, error: null };
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return { data: null, error };
    }
  },

  // Delete task
  async deleteTask(taskId) {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
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

      const q = query(
        collection(db, 'tasks'),
        where('user_id', '==', userId),
        where('created_at', '>=', startDate.toISOString())
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());

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
      
      const q = query(
        collection(db, 'tasks'),
        where('user_id', '==', userId),
        orderBy('created_at', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(task => {
          const taskDate = task.due_date?.split('T')[0] || task.created_at?.split('T')[0];
          return taskDate === today;
        });
      
      return { data: tasks, error: null };
    } catch (error) {
      console.error('Error fetching today\'s tasks:', error);
      return { data: [], error };
    }
  },

  // Get overdue tasks
  async getOverdueTasks(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const q = query(
        collection(db, 'tasks'),
        where('user_id', '==', userId),
        where('completed', '==', false),
        orderBy('due_date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(task => task.due_date && task.due_date < today);
      
      return { data: tasks, error: null };
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      return { data: [], error };
    }
  }
};

export default taskService;
