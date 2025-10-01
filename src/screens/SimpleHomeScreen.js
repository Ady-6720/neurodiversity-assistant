// src/screens/HomeScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = () => {
  const { user, profile, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.success) {
      // Handle error - you might want to show an alert
      console.error('Sign out failed:', result.error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.nameText}>
            {profile?.name || 'User'}
          </Text>
          <Text style={styles.emailText}>
            {user?.email}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.primaryAction]}
            onPress={() => console.log('Start activity')}
          >
            <Text style={[styles.actionTitle, styles.primaryActionTitle]}>
              Start Daily Activity
            </Text>
            <Text style={[styles.actionDescription, styles.primaryActionDescription]}>
              Begin your personalized routine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => console.log('View progress')}
          >
            <Text style={styles.actionTitle}>View Progress</Text>
            <Text style={styles.actionDescription}>
              Check your achievements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => console.log('Settings')}
          >
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionDescription}>
              Customize your experience
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: '#5A6C7D',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#7B8794',
  },
  actionsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E1E8ED',
    minHeight: 80,
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#5A6C7D',
  },
  primaryActionTitle: {
    color: '#FFFFFF',
  },
  primaryActionDescription: {
    color: '#E8F2FF',
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;

