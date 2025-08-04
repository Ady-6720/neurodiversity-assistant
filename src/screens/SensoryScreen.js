import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { Card, Button, IconButton, FAB, Portal, Modal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../config/theme';
import { sensoryService, sensoryToolsData } from '../services/sensoryService';
import { useAuth } from '../contexts/AuthContext';

const SensoryScreen = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userPreferences, setUserPreferences] = useState({});
  const [recommendations, setRecommendations] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load user preferences
      const { data: prefs, error: prefsError } = await sensoryService.getUserPreferences(user.id);
      if (prefsError) {
        console.error('Error loading preferences:', prefsError);
      }
      
      const prefsMap = {};
      if (prefs && Array.isArray(prefs)) {
        prefs.forEach(pref => {
          if (pref && pref.sensory_type) {
            prefsMap[pref.sensory_type] = pref;
          }
        });
      }
      setUserPreferences(prefsMap);

      // Load recommendations
      const { data: recs, error: recsError } = await sensoryService.getRecommendedStrategies(user.id);
      if (recsError) {
        console.error('Error loading recommendations:', recsError);
      }
      setRecommendations(recs || {});
    } catch (error) {
      console.error('Error loading sensory data:', error);
      // Set default empty states to prevent crashes
      setUserPreferences({});
      setRecommendations({});
    } finally {
      setLoading(false);
    }
  };

  const sensoryTools = Object.values(sensoryToolsData || {});

  const sensoryTypes = [
    { key: 'sound', label: 'Sound', icon: 'ear-hearing' },
    { key: 'light', label: 'Light', icon: 'eye-outline' },
    { key: 'texture', label: 'Texture', icon: 'hand-peace' },
    { key: 'smell', label: 'Smell', icon: 'nose' },
    { key: 'taste', label: 'Taste', icon: 'food-apple' },
    { key: 'movement', label: 'Movement', icon: 'run' }
  ];

  const CategoryButton = ({ category, title, isSelected }) => (
    <Button
      mode={isSelected ? "contained" : "outlined"}
      onPress={() => setSelectedCategory(category)}
      style={styles.categoryButton}
      labelStyle={isSelected && styles.selectedButtonText}
      icon={({size, color}) => (
        <MaterialCommunityIcons 
          name={getCategoryIcon(category)} 
          size={size} 
          color={color}
        />
      )}
    >
      {title}
    </Button>
  );

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'visual': return 'eye-outline';
      case 'audio': return 'ear-hearing';
      case 'touch': return 'hand-peace';
      case 'movement': return 'run';
      default: return 'apps';
    }
  };

  const getSensitivityLabel = (level) => {
    switch (level) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'Moderate';
      case 4: return 'High';
      case 5: return 'Very High';
      default: return 'Moderate';
    }
  };

  const getSensitivityColor = (level) => {
    switch (level) {
      case 1: return '#4CAF50';
      case 2: return '#8BC34A';
      case 3: return '#FFC107';
      case 4: return '#FF9800';
      case 5: return '#F44336';
      default: return '#FFC107';
    }
  };

  const openToolModal = (tool) => {
    setSelectedTool(tool);
    setModalVisible(true);
  };

  const trackSensoryEvent = async (sensoryType, intensity, triggers, strategies, notes = '') => {
    if (!user) return;
    
    try {
      const { error } = await sensoryService.trackSensoryEvent(
        user.id,
        sensoryType,
        intensity,
        triggers,
        strategies,
        notes
      );
      
      if (error) throw error;
      Alert.alert('Success', 'Sensory event tracked successfully');
    } catch (error) {
      console.error('Error tracking sensory event:', error);
      Alert.alert('Error', 'Failed to track sensory event');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Sensory Profile</Text>
          <View style={styles.statsGrid}>
            {Object.keys(userPreferences).length > 0 ? (
              Object.entries(userPreferences).map(([type, pref]) => {
                const typeInfo = sensoryTypes.find(t => t.key === type);
                return (
                  <View key={type} style={styles.statCard}>
                    <MaterialCommunityIcons 
                      name={typeInfo?.icon || 'circle'} 
                      size={20} 
                      color={getSensitivityColor(pref.sensitivity_level)}
                    />
                    <Text style={styles.statLabel}>{typeInfo?.label || type}</Text>
                    <Text style={styles.statValue}>{getSensitivityLabel(pref.sensitivity_level)}</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyStats}>
                <Text style={styles.emptyStatsText}>No preferences set yet</Text>
                <Text style={styles.emptyStatsSubtext}>Set your sensory preferences to get personalized recommendations</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <MaterialCommunityIcons name="cog" size={24} color={colors.primary} />
              <Text style={styles.quickActionTitle}>Set Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <MaterialCommunityIcons name="chart-line" size={24} color={colors.primary} />
              <Text style={styles.quickActionTitle}>Track Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <MaterialCommunityIcons name="star" size={24} color={colors.primary} />
              <Text style={styles.quickActionTitle}>Favorites</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended Tools */}
        <View style={styles.recommendedContainer}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          {Object.keys(userPreferences).length > 0 ? (
            sensoryTools
              .filter(category => userPreferences[category.category])
              .slice(0, 2)
              .map(category => 
                category.items
                  .filter(item => {
                    const pref = userPreferences[category.category];
                    return pref && pref.sensitivity_level >= 4;
                  })
                  .slice(0, 2)
                  .map(item => (
                    <View key={item.id} style={styles.recommendedTool}>
                      <MaterialCommunityIcons 
                        name={item.icon} 
                        size={24} 
                        color={colors.primary}
                      />
                      <View style={styles.recommendedToolContent}>
                        <Text style={styles.recommendedToolTitle}>{item.title}</Text>
                        <Text style={styles.recommendedToolDescription}>{item.description}</Text>
                      </View>
                    </View>
                  ))
              )
          ) : (
            <View style={styles.emptyRecommendations}>
              <Text style={styles.emptyRecommendationsText}>Set your preferences to see personalized recommendations</Text>
            </View>
          )}
        </View>

        {/* All Tools - Simplified */}
        <View style={styles.allToolsContainer}>
          <Text style={styles.sectionTitle}>All Sensory Tools</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoryScroll}
          >
            <CategoryButton 
              category="all" 
              title="All" 
              isSelected={selectedCategory === 'all'}
            />
            {sensoryTools.map(category => (
              <CategoryButton
                key={category.category}
                category={category.category}
                title={category.title}
                isSelected={selectedCategory === category.category}
              />
            ))}
          </ScrollView>

          <View style={styles.toolsContainer}>
            {sensoryTools
              .filter(category => selectedCategory === 'all' || category.category === selectedCategory)
              .map(category => (
                <View key={category.category}>
                  {category.items.map(item => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.simpleToolCard}
                      onPress={() => openToolModal(item)}
                    >
                      <MaterialCommunityIcons 
                        name={item.icon} 
                        size={24} 
                        color={colors.primary}
                      />
                      <View style={styles.simpleToolContent}>
                        <Text style={styles.simpleToolTitle}>{item.title}</Text>
                        <Text style={styles.simpleToolDescription}>{item.description}</Text>
                      </View>
                      <MaterialCommunityIcons 
                        name="chevron-right" 
                        size={20} 
                        color={colors.subtext}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            }
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedTool && (
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedTool.title}</Text>
              <Text style={styles.modalDescription}>{selectedTool.description}</Text>
              
              {selectedTool.strategies && selectedTool.strategies.length > 0 && (
                <View style={styles.strategiesContainer}>
                  <Text style={styles.strategiesTitle}>Detailed Strategies:</Text>
                  {selectedTool.strategies.map((strategy, index) => (
                    <View key={index} style={styles.strategyItem}>
                      <MaterialCommunityIcons 
                        name="lightbulb-outline" 
                        size={16} 
                        color={colors.primary}
                      />
                      <Text style={styles.strategyText}>{strategy || 'Strategy not available'}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={() => setModalVisible(false)}>
                  Close
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => {
                    // TODO: Add to favorites or track usage
                    setModalVisible(false);
                  }}
                >
                  Add to Favorites
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  // Stats Section
  statsContainer: {
    marginBottom: spacing.lg,
  },
  statsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    paddingHorizontal: spacing.xs,
  },
  statCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    minHeight: 85,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  emptyStats: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  emptyStatsText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  emptyStatsSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    textAlign: 'center',
    marginTop: spacing.xs,
    width: '100%',
    flexWrap: 'wrap',
  },
  // Quick Actions
  quickActionsContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: spacing.sm,
  },
  quickActionCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    minHeight: 90,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  // Recommended Tools
  recommendedContainer: {
    marginBottom: spacing.lg,
  },
  recommendedTool: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendedToolContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  recommendedToolTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  recommendedToolDescription: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginTop: spacing.xs,
  },
  emptyRecommendations: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyRecommendationsText: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    textAlign: 'center',
  },
  // All Tools Section
  allToolsContainer: {
    marginBottom: spacing.lg,
  },
  categoryScroll: {
    marginBottom: spacing.md,
  },
  categoryButton: {
    marginRight: spacing.sm,
    borderRadius: 20,
  },
  selectedButtonText: {
    color: colors.surface,
  },
  toolsContainer: {
    gap: spacing.sm,
  },
  simpleToolCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  simpleToolContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  simpleToolTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  simpleToolDescription: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginTop: spacing.xs,
  },
  // Modal Styles
  modalContent: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    marginBottom: spacing.lg,
  },
  strategiesContainer: {
    marginBottom: spacing.lg,
  },
  strategiesTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  strategyText: {
    marginLeft: spacing.sm,
    color: colors.text,
    fontSize: typography.sizes.md,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
});

export default SensoryScreen;