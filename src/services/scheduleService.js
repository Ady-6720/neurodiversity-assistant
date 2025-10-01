import { db } from '../config/firebase';
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
  orderBy 
} from 'firebase/firestore';

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

      const scheduleRef = await addDoc(collection(db, 'schedules'), {
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
      });

      const scheduleSnap = await getDoc(scheduleRef);
      return { data: { id: scheduleSnap.id, ...scheduleSnap.data() }, error: null };
    } catch (error) {
      console.error('Error creating schedule item:', error);
      return { data: null, error };
    }
  },

  // Get user's schedule for a specific date
  async getScheduleByDate(userId, date) {
    try {
      const q = query(
        collection(db, 'schedules'),
        where('user_id', '==', userId),
        where('scheduled_date', '==', date),
        orderBy('scheduled_time', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const schedules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data: schedules, error: null };
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return { data: [], error };
    }
  },

  // Get user's schedule for a date range
  async getScheduleByDateRange(userId, startDate, endDate) {
    try {
      const q = query(
        collection(db, 'schedules'),
        where('user_id', '==', userId),
        where('scheduled_date', '>=', startDate),
        where('scheduled_date', '<=', endDate),
        orderBy('scheduled_date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const schedules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data: schedules, error: null };
    } catch (error) {
      console.error('Error fetching schedule range:', error);
      return { data: [], error };
    }
  },

  // Update schedule item
  async updateScheduleItem(scheduleId, updates) {
    try {
      const scheduleRef = doc(db, 'schedules', scheduleId);
      await updateDoc(scheduleRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });

      const scheduleSnap = await getDoc(scheduleRef);
      return { data: { id: scheduleSnap.id, ...scheduleSnap.data() }, error: null };
    } catch (error) {
      console.error('Error updating schedule item:', error);
      return { data: null, error };
    }
  },

  // Mark schedule item as completed
  async completeScheduleItem(scheduleId) {
    try {
      const scheduleRef = doc(db, 'schedules', scheduleId);
      await updateDoc(scheduleRef, {
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const scheduleSnap = await getDoc(scheduleRef);
      return { data: { id: scheduleSnap.id, ...scheduleSnap.data() }, error: null };
    } catch (error) {
      console.error('Error completing schedule item:', error);
      return { data: null, error };
    }
  },

  // Delete schedule item
  async deleteScheduleItem(scheduleId) {
    try {
      await deleteDoc(doc(db, 'schedules', scheduleId));
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

      const q = query(
        collection(db, 'schedules'),
        where('user_id', '==', userId),
        where('scheduled_date', '>=', startDate.toISOString().split('T')[0]),
        where('scheduled_date', '<=', endDate.toISOString().split('T')[0])
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());

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
