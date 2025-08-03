import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, Alert } from 'react-native';
import { 
  Card, 
  Button, 
  TextInput, 
  Chip,
  Title,
  Paragraph,
  Slider,
  FAB,
  Portal,
  Modal,
  List
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../config/theme';
import { sensoryService } from '../services/sensoryService';
import { useAuth } from '../contexts/AuthContext';

const SensoryPreferencesScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    sensitivityLevel: 3,
    triggers: [],
    copingStrategies: []
  });

  const sensoryTypes = [
    { key: 'sound', label: 'Sound', icon: 'ear-hearing' },
    { key: 'light', label: 'Light', icon: 'eye-outline' },
    { key: 'texture', label: 'Texture', icon: 'hand-peace' },
    { key: 'smell', label: 'Smell', icon: 'nose' },
    { key: 'taste', label: 'Taste', icon: 'food-apple' },
    { key: 'movement', label: 'Movement', icon: 'run' }
  ];

  const commonTriggers = {
    sound: ['Loud noises', 'Sudden sounds', 'Multiple conversations', 'Background music', 'Phone notifications'],
    light: ['Bright lights', 'Fluorescent lighting', 'Flickering lights', 'Direct sunlight', 'Screen brightness'],
    texture: ['Rough fabrics', 'Sticky surfaces', 'Wet clothing', 'Tight clothing', 'Synthetic materials'],
    smell: ['Strong perfumes', 'Food odors', 'Cleaning chemicals', 'Smoke', 'Body odors'],
    taste: ['Spicy foods', 'Bitter tastes', 'Texture of foods', 'Temperature of foods', 'Mixed flavors'],
    movement: ['Crowded spaces', 'Sudden movements', 'Unpredictable motion', 'Balance challenges', 'Physical contact']
  };

  const commonStrategies = {
    sound: ['Noise-canceling headphones', 'Find quiet spaces', 'Use white noise', 'Request quiet environments'],
    light: ['Wear sunglasses', 'Use dimmer switches', 'Avoid bright lights', 'Use blue light filters'],
    texture: ['Choose comfortable fabrics', 'Test materials first', 'Have backup clothing', 'Use soft materials'],
    smell: ['Use air fresheners', 'Avoid strong scents', 'Ventilate spaces', 'Use unscented products'],
    taste: ['Choose familiar foods', 'Test small portions', 'Avoid problematic textures', 'Use preferred temperatures'],
    movement: ['Maintain personal space', 'Use visual boundaries', 'Practice grounding exercises', 'Find open spaces']
  };

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await sensoryService.getUserPreferences(user.id);
      if (error) throw error;
      
      const prefsMap = {};
      data?.forEach(pref => {
        prefsMap[pref.sensory_type] = pref;
      });
      setPreferences(prefsMap);
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'Failed to load your sensory preferences');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (sensoryType) => {
    const existingPref = preferences[sensoryType];
    setEditingType(sensoryType);
    setFormData({
      sensitivityLevel: existingPref?.sensitivity_level || 3,
      triggers: existingPref?.triggers || [],
      copingStrategies: existingPref?.coping_strategies || []
    });
    setModalVisible(true);
  };

  const savePreference = async () => {
    if (!user || !editingType) return;

    setLoading(true);
    try {
      const { error } = await sensoryService.saveSensoryPreference(
        user.id,
        editingType,
        formData.sensitivityLevel,
        formData.triggers,
        formData.copingStrategies
      );

      if (error) throw error;

      // Update local state
      setPreferences(prev => ({
        ...prev,
        [editingType]: {
          user_id: user.id,
          sensory_type: editingType,
          sensitivity_level: formData.sensitivityLevel,
          triggers: formData.triggers,
          coping_strategies: formData.copingStrategies
        }
      }));

      setModalVisible(false);
      Alert.alert('Success', 'Sensory preference saved successfully');
    } catch (error) {
      console.error('Error saving preference:', error);
      Alert.alert('Error', 'Failed to save sensory preference');
    } finally {
      setLoading(false);
    }
  };

  const addTrigger = (trigger) => {
    if (!formData.triggers.includes(trigger)) {
      setFormData(prev => ({
        ...prev,
        triggers: [...prev.triggers, trigger]
      }));
    }
  };

  const removeTrigger = (trigger) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }));
  };

  const addStrategy = (strategy) => {
    if (!formData.copingStrategies.includes(strategy)) {
      setFormData(prev => ({
        ...prev,
        copingStrategies: [...prev.copingStrategies, strategy]
      }));
    }
  };

  const removeStrategy = (strategy) => {
    setFormData(prev => ({
      ...prev,
      copingStrategies: prev.copingStrategies.filter(s => s !== strategy)
    }));
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

  const renderPreferenceCard = (sensoryType) => {
    const pref = preferences[sensoryType];
    const typeInfo = sensoryTypes.find(t => t.key === sensoryType);

    return (
      <Card key={sensoryType} style={styles.preferenceCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons 
              name={typeInfo?.icon} 
              size={24} 
              color={colors.primary}
            />
            <Title style={styles.cardTitle}>{typeInfo?.label}</Title>
          </View>

          {pref ? (
            <View style={styles.preferenceInfo}>
              <View style={styles.sensitivityContainer}>
                <Text style={styles.sensitivityLabel}>Sensitivity Level:</Text>
                <Chip 
                  mode="outlined" 
                  style={[styles.sensitivityChip, { borderColor: getSensitivityColor(pref.sensitivity_level) }]}
                  textStyle={{ color: getSensitivityColor(pref.sensitivity_level) }}
                >
                  {getSensitivityLabel(pref.sensitivity_level)}
                </Chip>
              </View>

              {pref.triggers?.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text style={styles.tagsLabel}>Triggers:</Text>
                  <View style={styles.tagsList}>
                    {pref.triggers.slice(0, 3).map((trigger, index) => (
                      <Chip key={index} style={styles.tag} mode="outlined" compact>
                        {trigger}
                      </Chip>
                    ))}
                    {pref.triggers.length > 3 && (
                      <Chip style={styles.tag} mode="outlined" compact>
                        +{pref.triggers.length - 3} more
                      </Chip>
                    )}
                  </View>
                </View>
              )}

              {pref.coping_strategies?.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text style={styles.tagsLabel}>Strategies:</Text>
                  <View style={styles.tagsList}>
                    {pref.coping_strategies.slice(0, 2).map((strategy, index) => (
                      <Chip key={index} style={styles.tag} mode="outlined" compact>
                        {strategy}
                      </Chip>
                    ))}
                    {pref.coping_strategies.length > 2 && (
                      <Chip style={styles.tag} mode="outlined" compact>
                        +{pref.coping_strategies.length - 2} more
                      </Chip>
                    )}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <Paragraph style={styles.noPreference}>
              No preference set. Tap to configure.
            </Paragraph>
          )}
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="outlined" 
            onPress={() => openEditModal(sensoryType)}
            icon="pencil"
          >
            {pref ? 'Edit' : 'Set Preference'}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Title style={styles.title}>Sensory Preferences</Title>
        <Paragraph style={styles.subtitle}>
          Configure your sensory sensitivities and coping strategies
        </Paragraph>

        {sensoryTypes.map(type => renderPreferenceCard(type.key))}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>
              {editingType ? `${sensoryTypes.find(t => t.key === editingType)?.label} Preferences` : 'Sensory Preferences'}
            </Title>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Sensitivity Level: {getSensitivityLabel(formData.sensitivityLevel)}</Text>
              <Slider
                value={formData.sensitivityLevel}
                onValueChange={value => setFormData(prev => ({ ...prev, sensitivityLevel: value }))}
                minimumValue={1}
                maximumValue={5}
                step={1}
                style={styles.slider}
                minimumTrackTintColor={getSensitivityColor(formData.sensitivityLevel)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Common Triggers</Text>
              <View style={styles.chipContainer}>
                {commonTriggers[editingType]?.map(trigger => (
                  <Chip
                    key={trigger}
                    selected={formData.triggers.includes(trigger)}
                    onPress={() => formData.triggers.includes(trigger) ? removeTrigger(trigger) : addTrigger(trigger)}
                    style={styles.chip}
                    mode="outlined"
                  >
                    {trigger}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coping Strategies</Text>
              <View style={styles.chipContainer}>
                {commonStrategies[editingType]?.map(strategy => (
                  <Chip
                    key={strategy}
                    selected={formData.copingStrategies.includes(strategy)}
                    onPress={() => formData.copingStrategies.includes(strategy) ? removeStrategy(strategy) : addStrategy(strategy)}
                    style={styles.chip}
                    mode="outlined"
                  >
                    {strategy}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={savePreference}
                loading={loading}
                disabled={loading}
              >
                Save
              </Button>
            </View>
          </ScrollView>
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
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    marginBottom: spacing.lg,
  },
  preferenceCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  preferenceInfo: {
    marginBottom: spacing.sm,
  },
  sensitivityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sensitivityLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginRight: spacing.sm,
  },
  sensitivityChip: {
    borderWidth: 2,
  },
  tagsContainer: {
    marginBottom: spacing.sm,
  },
  tagsLabel: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginBottom: spacing.xs,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  noPreference: {
    color: colors.subtext,
    fontStyle: 'italic',
  },
  modalContent: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: spacing.lg,
  },
  sliderLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  slider: {
    height: 40,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    marginBottom: spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
});

export default SensoryPreferencesScreen; 