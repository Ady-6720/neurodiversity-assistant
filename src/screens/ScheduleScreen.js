import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { 
  Portal, 
  Modal, 
  FAB, 
  IconButton,
  TextInput,
  ActivityIndicator,
  Snackbar,
  Button,
  Card,
  Text,
  Chip
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { scheduleService } from '../services/scheduleService';

const ScheduleScreen = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    morning: true,
    afternoon: true,
    evening: true
  });
  const [newActivity, setNewActivity] = useState({
    title: '',
    time: '09:00',
    duration: '30',
    category: 'work'
  });
  
  const scrollViewRef = useRef(null);
  const fabScale = useRef(new Animated.Value(1)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSchedule();
  }, [user, currentDate]);

  // Pulse FAB when no schedules
  useEffect(() => {
    if (schedules.length === 0 && !loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(fabScale, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fabScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [schedules.length, loading]);

  // Animate modal entrance
  useEffect(() => {
    if (modalVisible) {
      Animated.spring(modalAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      modalAnim.setValue(0);
    }
  }, [modalVisible]);

  const loadSchedule = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const dateString = currentDate.toISOString().split('T')[0];
      const { data, error } = await scheduleService.getScheduleByDate(user.id, dateString);
      if (error) {
        console.error('Error loading schedule:', error);
      } else {
        setSchedules(data || []);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async () => {
    // Validation
    if (!newActivity.title.trim()) {
      setSnackbarMessage('Enter an event title');
      setSnackbarVisible(true);
      return;
    }

    const dur = parseInt(newActivity.duration, 10);
    if (!dur || dur <= 0 || dur > 480) {
      setSnackbarMessage('Duration must be between 5 and 480 minutes');
      setSnackbarVisible(true);
      return;
    }

    if (!user) return;

    try {
      const scheduleData = {
        title: newActivity.title.trim(),
        time: newActivity.time,
        duration: dur,
        category: newActivity.category,
        date: currentDate.toISOString().split('T')[0]
      };

      const { data, error } = await scheduleService.createScheduleItem(user.id, scheduleData);
      if (error) {
        setSnackbarMessage('Failed to add activity');
      } else {
        setSchedules([...schedules, data]);
        setNewActivity({ title: '', time: '09:00', duration: '30', category: 'work' });
        setModalVisible(false);
        setSnackbarMessage('Activity added');
      }
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage('Failed to add activity');
      setSnackbarVisible(true);
    }
  };

  const deleteActivity = async (id) => {
    try {
      const { error } = await scheduleService.deleteScheduleItem(id);
      if (error) {
        setSnackbarMessage('Failed to delete activity');
      } else {
        setSchedules(schedules.filter(s => s.id !== id));
        setSnackbarMessage('Activity deleted');
      }
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage('Failed to delete activity');
      setSnackbarVisible(true);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const getCurrentHour = () => {
    return new Date().getHours();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      work: { bg: '#EFF6FF', text: '#3B82F6', icon: 'briefcase' },
      health: { bg: '#ECFDF5', text: '#10B981', icon: 'heart-pulse' },
      focus: { bg: '#F5F3FF', text: '#8B5CF6', icon: 'brain' },
      break: { bg: '#FFF7ED', text: '#F59E0B', icon: 'coffee' },
      social: { bg: '#FDF2F8', text: '#EC4899', icon: 'account-group' },
    };
    return colors[category] || colors.work;
  };

  const getSchedulesBySection = () => {
    const morning = schedules.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 6 && hour < 12;
    });
    const afternoon = schedules.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 12 && hour < 18;
    });
    const evening = schedules.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 18 || hour < 6;
    });
    return { morning, afternoon, evening };
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = getSchedulesBySection();
  const currentHour = getCurrentHour();

  const ScheduleItem = ({ schedule }) => {
    const categoryStyle = getCategoryColor(schedule.category);
    return (
      <Card style={[styles.scheduleCard, { backgroundColor: categoryStyle.bg }]}>
        <Card.Content style={styles.scheduleContent}>
          <View style={styles.scheduleTime}>
            <Text style={styles.timeText}>{schedule.time}</Text>
            <Text style={styles.durationText}>{schedule.duration}m</Text>
          </View>
          <View style={styles.scheduleInfo}>
            <View style={styles.scheduleHeader}>
              <MaterialCommunityIcons 
                name={categoryStyle.icon} 
                size={18} 
                color={categoryStyle.text}
              />
              <Text style={[styles.scheduleTitle, { color: categoryStyle.text }]}>
                {schedule.title}
              </Text>
            </View>
            <Text style={styles.categoryLabel}>{schedule.category}</Text>
          </View>
          <IconButton
            icon="close"
            size={18}
            iconColor={colors.subtext}
            onPress={() => deleteActivity(schedule.id)}
          />
        </Card.Content>
      </Card>
    );
  };

  const SectionHeader = ({ title, count, section, timeRange }) => (
    <TouchableOpacity 
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
    >
      <View style={styles.sectionHeaderLeft}>
        <MaterialCommunityIcons 
          name={expandedSections[section] ? 'chevron-down' : 'chevron-right'} 
          size={24} 
          color={colors.text}
        />
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionTime}>{timeRange}</Text>
      </View>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Date Navigation */}
      <View style={styles.header}>
        <View style={styles.dateNav}>
          <IconButton
            icon="chevron-left"
            size={24}
            onPress={() => changeDate(-1)}
          />
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
            {!isToday() && (
              <Button 
                mode="text" 
                onPress={goToToday}
                compact
                labelStyle={styles.todayButtonLabel}
              >
                Today
              </Button>
            )}
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={() => changeDate(1)}
          />
        </View>
      </View>

      {/* Schedule Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      ) : schedules.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons 
                name="calendar-blank" 
                size={64} 
                color={colors.primary}
              />
              <Text style={styles.emptyTitle}>Your schedule is clear today</Text>
              <Text style={styles.emptySubtitle}>
                Tap + to plan something and stay organized
              </Text>
              <Button 
                mode="contained" 
                onPress={() => setModalVisible(true)}
                style={styles.emptyButton}
                icon="plus"
              >
                Add First Activity
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Morning Section */}
          <SectionHeader 
            title="Morning" 
            count={sections.morning.length}
            section="morning"
            timeRange="6 AM - 12 PM"
          />
          {expandedSections.morning && (
            <View style={styles.sectionContent}>
              {sections.morning.length > 0 ? (
                sections.morning.map(schedule => (
                  <ScheduleItem key={schedule.id} schedule={schedule} />
                ))
              ) : (
                <Text style={styles.emptySection}>No activities scheduled</Text>
              )}
            </View>
          )}

          {/* Afternoon Section */}
          <SectionHeader 
            title="Afternoon" 
            count={sections.afternoon.length}
            section="afternoon"
            timeRange="12 PM - 6 PM"
          />
          {expandedSections.afternoon && (
            <View style={styles.sectionContent}>
              {sections.afternoon.length > 0 ? (
                sections.afternoon.map(schedule => (
                  <ScheduleItem key={schedule.id} schedule={schedule} />
                ))
              ) : (
                <Text style={styles.emptySection}>No activities scheduled</Text>
              )}
            </View>
          )}

          {/* Evening Section */}
          <SectionHeader 
            title="Evening" 
            count={sections.evening.length}
            section="evening"
            timeRange="6 PM - 12 AM"
          />
          {expandedSections.evening && (
            <View style={styles.sectionContent}>
              {sections.evening.length > 0 ? (
                sections.evening.map(schedule => (
                  <ScheduleItem key={schedule.id} schedule={schedule} />
                ))
              ) : (
                <Text style={styles.emptySection}>No activities scheduled</Text>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* FAB - Only show when modal is closed */}
      {!modalVisible && (
        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <FAB
            style={styles.fab}
            icon="plus"
            color="#FFFFFF"
            onPress={() => setModalVisible(true)}
          />
        </Animated.View>
      )}

      {/* Add Activity Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          dismissable
          style={styles.modalOverlay}
        >
          {/* Backdrop */}
          <Pressable 
            style={styles.backdrop} 
            onPress={() => setModalVisible(false)}
          />
          
          {/* Modal Card */}
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalAnim,
                transform: [{
                  translateY: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
              },
            ]}
          >
            <Text style={styles.modalTitle}>Add to Schedule</Text>
            
            <Text style={styles.label}>Time</Text>
            <TextInput
              value={newActivity.time}
              onChangeText={(text) => setNewActivity({...newActivity, time: text})}
              placeholder="09:00"
              mode="outlined"
              style={styles.input}
              accessibilityLabel="Event time"
            />

            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationChips}>
              {['15', '30', '45', '60'].map(min => (
                <Chip
                  key={min}
                  selected={newActivity.duration === min}
                  onPress={() => setNewActivity({...newActivity, duration: min})}
                  style={styles.durationChip}
                >
                  {min}m
                </Chip>
              ))}
            </View>
            <TextInput
              value={newActivity.duration}
              onChangeText={(text) => setNewActivity({...newActivity, duration: text})}
              placeholder="30"
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              accessibilityLabel="Duration in minutes"
            />

            <Text style={styles.label}>What's happening?</Text>
            <TextInput
              value={newActivity.title}
              onChangeText={(text) => setNewActivity({...newActivity, title: text})}
              placeholder="e.g., Team meeting"
              mode="outlined"
              style={styles.input}
              autoFocus
              accessibilityLabel="Event title"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {['work', 'health', 'focus', 'break', 'social'].map(cat => {
                const style = getCategoryColor(cat);
                const isSelected = newActivity.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: style.bg },
                      isSelected && styles.categoryChipActive
                    ]}
                    onPress={() => setNewActivity({...newActivity, category: cat})}
                    accessibilityLabel={`${cat} category`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <MaterialCommunityIcons 
                      name={style.icon} 
                      size={16} 
                      color={style.text}
                    />
                    <Text style={[styles.categoryChipText, { color: style.text }]}>
                      {cat}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons 
                        name="check" 
                        size={14} 
                        color={style.text}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actionsBar}>
              <Button 
                mode="outlined" 
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={addActivity}
                style={styles.modalButton}
              >
                Add
              </Button>
            </View>
          </Animated.View>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  todayButtonLabel: {
    fontSize: 12,
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.subtext,
  },
  emptyContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: 20,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
    lineHeight: 28,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  emptyButton: {
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: spacing.xs,
  },
  sectionTime: {
    fontSize: 13,
    color: colors.subtext,
    marginLeft: spacing.sm,
  },
  sectionBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionContent: {
    marginBottom: spacing.lg,
  },
  emptySection: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  scheduleCard: {
    marginBottom: spacing.md,
    borderRadius: 16,
    elevation: 2,
  },
  scheduleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  scheduleTime: {
    marginRight: spacing.md,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  durationText: {
    fontSize: 11,
    color: colors.subtext,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoryLabel: {
    fontSize: 12,
    color: colors.subtext,
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  input: {
    marginBottom: spacing.xs,
    backgroundColor: '#FFFFFF',
  },
  durationChips: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  durationChip: {
    marginRight: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: spacing.xs,
    minWidth: '30%',
    justifyContent: 'center',
  },
  categoryChipActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#EEF4FF',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginLeft: 4,
    marginRight: 4,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
});

export default ScheduleScreen;
