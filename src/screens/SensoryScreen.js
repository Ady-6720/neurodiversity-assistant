import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, Alert } from 'react-native';
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
      if (prefsError) throw prefsError;
      
      const prefsMap = {};
      prefs?.forEach(pref => {
        prefsMap[pref.sensory_type] = pref;
      });
      setUserPreferences(prefsMap);

      // Load recommendations
      const { data: recs, error: recsError } = await sensoryService.getRecommendedStrategies(user.id);
      if (recsError) throw recsError;
      setRecommendations(recs || {});
    } catch (error) {
      console.error('Error loading sensory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sensoryTools = Object.values(sensoryToolsData);

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

  const renderToolCard = (item) => {
    const category = selectedCategory === 'all' ? 
      sensoryTools.find(cat => cat.items.some(tool => tool.id === item.id))?.category : 
      selectedCategory;
    
    const userPref = userPreferences[category];
    const isRecommended = userPref && userPref.sensitivity_level >= 4;

    return (
      <Card key={item.id} style={[styles.toolCard, isRecommended && styles.recommendedCard]}>
        <Card.Content>
          <View style={styles.toolHeader}>
            <MaterialCommunityIcons 
              name={item.icon} 
              size={24} 
              color={colors.primary}
            />
            <Text style={styles.toolTitle}>{item.title}</Text>
            {isRecommended && (
              <MaterialCommunityIcons 
                name="star" 
                size={16} 
                color={colors.warning}
                style={styles.recommendedIcon}
              />
            )}
          </View>
          <Text style={styles.toolDescription}>{item.description}</Text>
          
          {isRecommended && (
            <View style={styles.recommendationContainer}>
              <Text style={styles.recommendationText}>
                Recommended based on your {category} sensitivity
              </Text>
            </View>
          )}
          
          <View style={styles.tipsContainer}>
            {item.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <MaterialCommunityIcons 
                  name="check" 
                  size={16} 
                  color={colors.success}
                />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="outlined" 
            onPress={() => openToolModal(item)}
            icon="information"
          >
            Learn More
          </Button>
          {userPref && (
            <Button 
              mode="contained" 
              onPress={() => trackSensoryEvent(
                category,
                userPref.sensitivity_level,
                userPref.triggers || [],
                item.strategies || [],
                `Used ${item.title} tool`
              )}
              icon="plus"
            >
              Track Usage
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.mainTitle}>Sensory Management Tools</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryScroll}
        >
          <CategoryButton 
            category="all" 
            title="All Tools" 
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
                <Text style={styles.categoryTitle}>{category.title}</Text>
                {category.items.map(item => renderToolCard(item))}
              </View>
            ))
          }
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
              
              <View style={styles.strategiesContainer}>
                <Text style={styles.strategiesTitle}>Detailed Strategies:</Text>
                {selectedTool.strategies?.map((strategy, index) => (
                  <View key={index} style={styles.strategyItem}>
                    <MaterialCommunityIcons 
                      name="lightbulb-outline" 
                      size={16} 
                      color={colors.primary}
                    />
                    <Text style={styles.strategyText}>{strategy}</Text>
                  </View>
                ))}
              </View>

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
    padding: spacing.md,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  categoryScroll: {
    marginBottom: spacing.lg,
  },
  categoryButton: {
    marginRight: spacing.sm,
    borderRadius: 20,
  },
  selectedButtonText: {
    color: colors.surface,
  },
  toolsContainer: {
    gap: spacing.lg,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  toolCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  recommendedCard: {
    borderWidth: 2,
    borderColor: colors.warning,
    backgroundColor: colors.warning + '10',
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  recommendedIcon: {
    marginLeft: spacing.xs,
  },
  toolDescription: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: spacing.md,
  },
  recommendationContainer: {
    backgroundColor: colors.warning + '20',
    padding: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.md,
  },
  recommendationText: {
    fontSize: 12,
    color: colors.warning,
    fontStyle: 'italic',
  },
  tipsContainer: {
    backgroundColor: colors.accent1 + '20',
    padding: spacing.md,
    borderRadius: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tipText: {
    marginLeft: spacing.sm,
    color: colors.text,
    fontSize: 14,
  },
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