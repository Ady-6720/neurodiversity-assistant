import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { Portal, Modal, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../config/theme';
import { sensoryService, sensoryToolsData } from '../services/sensoryService';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const CARD_WIDTH = isSmallDevice ? width - spacing.xl * 2 : (width - spacing.xl * 3) / 2;

// Category color themes for visual distinction
const categoryColors = {
  'Visual Comfort': { bg: '#E3F2FD', icon: '#1976D2', accent: '#2196F3' },
  'Audio Comfort': { bg: '#F3E5F5', icon: '#7B1FA2', accent: '#9C27B0' },
  'Tactile Comfort': { bg: '#FFF3E0', icon: '#E65100', accent: '#FF9800' },
  'Movement Comfort': { bg: '#E8F5E9', icon: '#2E7D32', accent: '#4CAF50' },
};

const SensoryScreen = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

  const sensoryTools = Object.values(sensoryToolsData || {});

  const getCategoryIcon = (category) => {
    const iconMap = {
      'visual': 'eye-outline',
      'audio': 'ear-hearing',
      'touch': 'hand-peace',
      'tactile': 'hand-peace',
      'movement': 'run',
    };
    return iconMap[category.toLowerCase()] || 'apps';
  };

  const getCategoryTheme = (categoryTitle) => {
    return categoryColors[categoryTitle] || { 
      bg: colors.highlight, 
      icon: colors.primary, 
      accent: colors.secondary 
    };
  };

  const openToolModal = (tool, categoryTitle) => {
    setSelectedTool({ ...tool, categoryTitle });
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sensory Tools</Text>
        <Text style={styles.headerSubtitle}>Find comfort and balance</Text>
      </View>

      {/* Category Tabs - Grid */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryGrid}>
          <TouchableOpacity 
            style={[styles.categoryTab, selectedCategory === 'all' && styles.categoryTabActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <MaterialCommunityIcons 
              name="apps" 
              size={20} 
              color={selectedCategory === 'all' ? '#FFFFFF' : colors.subtext}
            />
            <Text style={[styles.categoryTabText, selectedCategory === 'all' && styles.categoryTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          {sensoryTools.map(category => (
            <TouchableOpacity
              key={category.title}
              style={[styles.categoryTab, selectedCategory === category.title && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(category.title)}
            >
              <MaterialCommunityIcons 
                name={getCategoryIcon(category.title)} 
                size={20} 
                color={selectedCategory === category.title ? '#FFFFFF' : colors.subtext}
              />
              <Text style={[styles.categoryTabText, selectedCategory === category.title && styles.categoryTabTextActive]}>
                {category.title.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tools Grid */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.toolsGrid}
      >
        {sensoryTools
          .filter(category => selectedCategory === 'all' || category.title === selectedCategory)
          .map(category => {
            const theme = getCategoryTheme(category.title);
            return category.items.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.toolCard, { backgroundColor: theme.bg }]}
                onPress={() => openToolModal(item, category.title)}
                activeOpacity={0.7}
                accessibilityLabel={`${item.title}: ${item.description}`}
                accessibilityRole="button"
                accessibilityHint="Tap to view details and strategies"
              >
                <View style={[styles.toolIconContainer, { backgroundColor: '#FFFFFF' }]}>
                  <MaterialCommunityIcons 
                    name={item.icon} 
                    size={36} 
                    color={theme.icon}
                  />
                </View>
                <Text style={styles.toolTitle}>
                  {item.title}
                </Text>
                <Text style={styles.toolDescription} numberOfLines={3}>
                  {item.description}
                </Text>
                <View style={[styles.categoryBadge, { backgroundColor: theme.accent }]}>
                  <Text style={styles.categoryBadgeText}>{category.title.split(' ')[0]}</Text>
                </View>
              </TouchableOpacity>
            ));
          })
        }
      </ScrollView>

      {/* Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedTool && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons 
                    name={selectedTool.icon} 
                    size={40} 
                    color={colors.primary}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color={colors.subtext} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>{selectedTool.title}</Text>
              <Text style={styles.modalDescription}>{selectedTool.description}</Text>
              
              {selectedTool.tips && selectedTool.tips.length > 0 && (
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>Quick Tips</Text>
                  {selectedTool.tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <View style={styles.tipBullet} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedTool.strategies && selectedTool.strategies.length > 0 && (
                <View style={styles.strategiesContainer}>
                  <Text style={styles.strategiesTitle}>Strategies</Text>
                  {selectedTool.strategies.map((strategy, index) => (
                    <View key={index} style={styles.strategyItem}>
                      <MaterialCommunityIcons 
                        name="check-circle" 
                        size={20} 
                        color={colors.success}
                      />
                      <Text style={styles.strategyText}>{strategy}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.modalActions}>
                <Button 
                  mode="contained" 
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                  labelStyle={styles.modalButtonLabel}
                >
                  Got it
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.subtext,
  },
  // Category Tabs - Grid
  categoryContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -4,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 4,
    marginBottom: spacing.sm,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Tools Grid
  scrollView: {
    flex: 1,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  toolCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  toolIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  toolDescription: {
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.sm,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Modal
  modalContent: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    borderRadius: 20,
    maxHeight: '85%',
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: 15,
    color: colors.subtext,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  // Tips
  tipsContainer: {
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
    marginRight: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  // Strategies
  strategiesContainer: {
    marginBottom: spacing.lg,
  },
  strategiesTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  strategyText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  // Modal Actions
  modalActions: {
    marginTop: spacing.md,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: spacing.xs,
  },
  modalButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SensoryScreen;
