// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// Create a .env.local file with your actual credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://znkmeyufelfhrrmumyzh.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpua21leXVmZWxmaHJybXVteXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzU0MzgsImV4cCI6MjA2OTgxMTQzOH0.sjHi_a8ytrzfGk3ta6xsQfWpXZxGaAyT3q8d_SISlG8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseHelpers = {
  // Authentication helpers
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Database helpers
  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select();
    return { data, error };
  },

  async getTasks(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async updateTask(taskId, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select();
    return { data, error };
  },

  async deleteTask(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    return { error };
  }
};
