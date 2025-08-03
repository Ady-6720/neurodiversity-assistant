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
  List,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../config/theme';
import { sensoryService } from '../services/sensoryService';
import { useAuth } from '../contexts/AuthContext';

const SensoryTrackingScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sensoryHistory, setSensoryHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    sensoryType: 'sound',
    intensityLevel: 3,
    triggers: [],
    copingStrategies: [],
    notes: ''
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
    loadSensoryHistory();
  }, []);

  const loadSensoryHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await sensoryService.getSensoryHistory(user.id, 20);
      if (error) throw error;
      setSensoryHistory(data || []);
    } catch (error) {
      console.error('Error loading sensory history:', error);
      Alert.alert('Error', 'Failed to load sensory history');
    } finally {
      setLoading(false);
    }
  };

  const openTrackingModal = () => {
    setFormData({
      sensoryType: 'sound',
      intensityLevel: 3,
      triggers: [],
      copingStrategies: [],
      notes: ''
    });
    setModalVisible(true);
  };

  const saveSensoryEvent = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await sensoryService.trackSensoryEvent(
        user.id,
        formData.sensoryType,
        formData.intensityLevel,
        formData.triggers,
        formData.copingStrategies,
        formData.notes
      );

      if (error) throw error;

      setModalVisible(false);
      Alert.alert('Success', 'Sensory event tracked successfully');
      loadSensoryHistory(); // Reload history
    } catch (error) {
      console.error('Error saving sensory event:', error);
      Alert.alert('Error', 'Failed to track sensory event');
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

  const getIntensityLabel = (level) => {
    switch (level) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'Moderate';
      case 4: return 'High';
      case 5: return 'Very High';
      default: return 'Moderate';
    }
  };

  const getIntensityColor = (level) => {
    switch (level) {
      case 1: return '#4CAF50';
      case 2: return '#8BC34A';
      case 3: return '#FFC107';
      case 4: return '#FF9800';
      case 5: return '#F44336';
      default: return '#FFC107';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderHistoryItem = (event) => {
    const typeInfo = sensoryTypes.find(t => t.key === event.sensory_type);

    return (
      <Card key={event.id} style={styles.historyCard}>
        <Card.Content>
          <View style={styles.eventHeader}>
            <MaterialCommunityIcons 
              name={typeInfo?.icon} 
              size={20} 
              color={colors.primary}
            />
            <Text style={styles.eventType}>{typeInfo?.label}</Text>
            <Chip 
              mode="outlined" 
              style={[styles.intensityChip, { borderColor: getIntensityColor(event.intensity_level) }]}
              textStyle={{ color: getIntensityColor(event.intensity_level) }}
            >
              {getIntensityLabel(event.intensity_level)}
            </Chip>
          </View>

          <Text style={styles.eventDate}>{formatDate(event.created_at)}</Text>

          {event.triggers?.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsLabel}>Triggers:</Text>
              <View style={styles.tagsList}>
                {event.triggers.map((trigger, index) => (
                  <Chip key={index} style={styles.tag} mode="outlined" compact>
                    {trigger}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {event.coping_strategies?.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsLabel}>Strategies Used:</Text>
              <View style={styles.tagsList}>
                {event.coping_strategies.map((strategy, index) => (
                  <Chip key={index} style={styles.tag} mode="outlined" compact>
                    {strategy}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {event.notes && (
            <Text style={styles.notes}>{event.notes}</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Title style={styles.title}>Sensory Event Tracking</Title>
        <Paragraph style={styles.subtitle}>
          Track your sensory experiences and coping strategies
        </Paragraph>

        {sensoryHistory.length > 0 ? (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Events</Text>
            {sensoryHistory.map(renderHistoryItem)}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <MaterialCommunityIcons 
                name="chart-line" 
                size={48} 
                color={colors.subtext}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Events Yet</Text>
              <Text style={styles.emptyText}>
                Start tracking your sensory experiences to better understand your patterns and needs.
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={openTrackingModal}
        label="Track Event"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Track Sensory Event</Title>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sensory Type</Text>
              <View style={styles.chipContainer}>
                {sensoryTypes.map(type => (
                  <Chip
                    key={type.key}
                    selected={formData.sensoryType === type.key}
                    onPress={() => setFormData(prev => ({ ...prev, sensoryType: type.key }))}
                    style={styles.chip}
                    mode="outlined"
                    icon={type.icon}
                  >
                    {type.label}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Intensity Level: {getIntensityLabel(formData.intensityLevel)}</Text>
              <Slider
                value={formData.intensityLevel}
                onValueChange={value => setFormData(prev => ({ ...prev, intensityLevel: value }))}
                minimumValue={1}
                maximumValue={5}
                step={1}
                style={styles.slider}
                minimumTrackTintColor={getIntensityColor(formData.intensityLevel)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Triggers</Text>
              <View style={styles.chipContainer}>
                {commonTriggers[formData.sensoryType]?.map(trigger => (
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
              <Text style={styles.sectionTitle}>Coping Strategies Used</Text>
              <View style={styles.chipContainer}>
                {commonStrategies[formData.sensoryType]?.map(strategy => (
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <TextInput
                value={formData.notes}
                onChangeText={text => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Describe your experience..."
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.notesInput}
              />
            </View>

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={saveSensoryEvent}
                loading={loading}
                disabled={loading}
              >
                Save Event
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
  historyContainer: {
    marginBottom: spacing.lg,
  },
  historyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  historyCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  eventType: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  intensityChip: {
    borderWidth: 2,
  },
  eventDate: {
    fontSize: typography.sizes.sm,
    color: colors.subtext,
    marginBottom: spacing.sm,
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
  notes: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  emptyCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
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
  notesInput: {
    marginTop: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
});

export default SensoryTrackingScreen; 