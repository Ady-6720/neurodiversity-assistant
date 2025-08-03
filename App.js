import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  Provider as PaperProvider, 
  DefaultTheme,
  configureFonts,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, StyleSheet, Text } from 'react-native';

// Import theme configuration using relative path
import { colors, typography, spacing, shapes } from './src/config/theme.js';

// Import contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { supabase } from './src/config/supabase';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import TaskScreen from './src/screens/TaskScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import SensoryScreen from './src/screens/SensoryScreen';
import CommunicationScreen from './src/screens/CommunicationScreen';
import FocusScreen from './src/screens/FocusScreen';
import CognitiveScreen from './src/screens/CognitiveScreen';
import StandardAuthScreen from './src/screens/StandardAuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SimpleOnboardingScreen from './src/screens/SimpleOnboardingScreen';

const Tab = createBottomTabNavigator();

// Custom theme configuration
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    placeholder: colors.subtext,
    error: colors.error,
  },
  fonts: configureFonts({
    default: {
      regular: {
        fontFamily: typography.families.regular,
        fontWeight: typography.weights.regular,
      },
      medium: {
        fontFamily: typography.families.regular,
        fontWeight: typography.weights.medium,
      },
      bold: {
        fontFamily: typography.families.regular,
        fontWeight: typography.weights.bold,
      },
    },
  }),
};

// Screen configurations with updated aesthetics
const screenConfigs = [
  {
    name: 'Home',
    component: HomeScreen,
    icon: 'home',
    label: 'Home',
    color: colors.primary
  },
  {
    name: 'Tasks',
    component: TaskScreen,
    icon: 'checkbox-marked-outline',
    label: 'Tasks',
    color: colors.secondary
  },
  {
    name: 'Schedule',
    component: ScheduleScreen,
    icon: 'calendar-clock',
    label: 'Schedule',
    color: colors.tertiary
  },
  {
    name: 'Sensory',
    component: SensoryScreen,
    icon: 'wave',
    label: 'Sensory',
    color: colors.accent1
  },
  {
    name: 'Communication',
    component: CommunicationScreen,
    icon: 'message-text',
    label: 'Communicate',
    color: colors.accent2
  },
  {
    name: 'Cognitive',
    component: CognitiveScreen,
    icon: 'brain',
    label: 'Cognitive',
    color: colors.focus
  }
];

// Main App Navigation Component
function AppNavigation() {
  const { user, loading, needsOnboarding, completeOnboarding } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <StandardAuthScreen />;
  }

  if (needsOnboarding) {
    return <SimpleOnboardingScreen onComplete={() => {}} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.surface,
            height: 60,
            paddingBottom: spacing.sm,
            paddingTop: spacing.sm,
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarItemStyle: {
            padding: spacing.xs,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtext,
          headerStyle: {
            backgroundColor: colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.accent3,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: typography.families.heading,
            fontWeight: typography.weights.semibold,
            fontSize: typography.sizes.lg,
          },
          tabBarLabelStyle: {
            fontSize: typography.sizes.xs,
            fontFamily: typography.families.regular,
            fontWeight: typography.weights.medium,
          },
        }}
      >
        {screenConfigs.map((screen) => (
          <Tab.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={{
              tabBarLabel: screen.label,
              tabBarIcon: ({ color, size, focused }) => (
                <MaterialCommunityIcons
                  name={screen.icon}
                  size={size}
                  color={focused ? screen.color : color}
                  style={{
                    opacity: focused ? 1 : 0.8,
                  }}
                />
              ),
              headerTitleAlign: 'center',
            }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    fontFamily: typography.families.regular,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar
          backgroundColor={colors.background}
          barStyle="dark-content"
        />
        <AuthProvider>
          <AppNavigation />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}