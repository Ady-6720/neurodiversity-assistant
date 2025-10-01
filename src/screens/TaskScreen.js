import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { 
  FAB, 
  Portal, 
  Modal, 
  TextInput, 
  Checkbox,
  IconButton,
  ActivityIndicator,
  Snackbar,
  Button,
  Card,
  Text
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/taskService';

const TaskScreen = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Animation for FAB pulse
  const fabScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadTasks();
  }, [user, filter]);

  // Pulse FAB when no tasks
  useEffect(() => {
    if (tasks.length === 0 && !loading) {
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
  }, [tasks.length, loading]);

  const loadTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await taskService.getUserTasks(user.id, filter);
      if (error) {
        console.error('Error loading tasks:', error);
        setSnackbarMessage('Failed to load tasks');
        setSnackbarVisible(true);
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setSnackbarMessage('Failed to load tasks');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const addTask = async () => {
    if (newTask.trim().length === 0) {
      setErrorMessage('Please enter a task description');
      return;
    }
    
    if (!user) {
      setErrorMessage('User not authenticated');
      return;
    }

    try {
      const taskData = {
        title: newTask.trim(),
        description: '',
        priority: 'medium',
        category: 'general'
      };

      const { data, error } = await taskService.createTask(user.id, taskData);
      if (error) {
        console.error('Error creating task:', error);
        setErrorMessage('Failed to create task');
      } else {
        setTasks([data, ...tasks]);
        setNewTask('');
        setModalVisible(false);
        setErrorMessage('');
        setSnackbarMessage('Task created successfully');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setErrorMessage('Failed to create task');
    }
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { error } = await taskService.updateTask(taskId, {
        completed: !task.completed
      });

      if (error) {
        console.error('Error updating task:', error);
        setSnackbarMessage('Failed to update task');
        setSnackbarVisible(true);
      } else {
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ));
        setSnackbarMessage(task.completed ? 'Task marked incomplete' : 'Task completed!');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      setSnackbarMessage('Failed to update task');
      setSnackbarVisible(true);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error } = await taskService.deleteTask(taskId);
      if (error) {
        console.error('Error deleting task:', error);
        setSnackbarMessage('Failed to delete task');
        setSnackbarVisible(true);
      } else {
        setTasks(tasks.filter(t => t.id !== taskId));
        setSnackbarMessage('Task deleted');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setSnackbarMessage('Failed to delete task');
      setSnackbarVisible(true);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

  const taskCounts = {
    all: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    incomplete: tasks.filter(task => !task.completed).length
  };

  const getEmptyStateMessage = () => {
    switch (filter) {
      case 'completed':
        return {
          title: 'No completed tasks',
          subtitle: 'Complete tasks to see them here'
        };
      case 'incomplete':
        return {
          title: 'No incomplete tasks',
          subtitle: 'All caught up! Great work!'
        };
      default:
        return {
          title: 'No tasks yet',
          subtitle: 'Stay on track by adding your first task'
        };
    }
  };

  const TaskItem = ({ task }) => (
    <Card style={styles.taskCard}>
      <Card.Content style={styles.taskContent}>
        <Checkbox.Android
          status={task.completed ? 'checked' : 'unchecked'}
          onPress={() => toggleTask(task.id)}
          color={colors.primary}
        />
        <View style={styles.taskTextContainer}>
          <Text 
            style={[
              styles.taskText,
              task.completed && styles.completedTask
            ]}
          >
            {task.title}
          </Text>
          <Text style={styles.taskDate}>
            {new Date(task.created_at || task.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <IconButton
          icon="delete"
          size={20}
          iconColor={colors.error}
          onPress={() => deleteTask(task.id)}
        />
      </Card.Content>
    </Card>
  );

  const emptyState = getEmptyStateMessage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <Text style={styles.headerSubtitle}>Stay organized and productive</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
          accessibilityLabel="Show all tasks"
        >
          <Text style={[styles.filterNumber, { color: '#3B82F6' }]}>{taskCounts.all}</Text>
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            All
          </Text>
          {filter === 'all' && <View style={styles.filterIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'incomplete' && styles.filterTabActive]}
          onPress={() => setFilter('incomplete')}
          accessibilityLabel="Show incomplete tasks"
        >
          <Text style={[styles.filterNumber, { color: '#F59E0B' }]}>{taskCounts.incomplete}</Text>
          <Text style={[styles.filterTabText, filter === 'incomplete' && styles.filterTabTextActive]}>
            Incomplete
          </Text>
          {filter === 'incomplete' && <View style={styles.filterIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
          accessibilityLabel="Show completed tasks"
        >
          <Text style={[styles.filterNumber, { color: '#10B981' }]}>{taskCounts.completed}</Text>
          <Text style={[styles.filterTabText, filter === 'completed' && styles.filterTabTextActive]}>
            Completed
          </Text>
          {filter === 'completed' && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.taskList}
          contentContainerStyle={styles.taskListContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          {filteredTasks.length === 0 ? (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyStateContent}>
                <MaterialCommunityIcons 
                  name="clipboard-check-outline" 
                  size={64} 
                  color={colors.primary}
                />
                <Text style={styles.emptyStateTitle}>{emptyState.title}</Text>
                <Text style={styles.emptyStateSubtitle}>{emptyState.subtitle}</Text>
                {filter === 'all' && (
                  <Button 
                    mode="contained" 
                    onPress={() => setModalVisible(true)}
                    style={styles.emptyStateButton}
                    icon="plus"
                  >
                    Add Your First Task
                  </Button>
                )}
              </Card.Content>
            </Card>
          ) : (
            filteredTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))
          )}
        </ScrollView>
      )}

      {/* Add Task FAB */}
      <Animated.View style={{ transform: [{ scale: fabScale }] }}>
        <FAB
          style={styles.fab}
          icon="plus"
          color="#FFFFFF"
          onPress={() => setModalVisible(true)}
          accessibilityLabel="Add new task"
        />
      </Animated.View>

      {/* Add Task Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setNewTask('');
            setErrorMessage('');
          }}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Add New Task</Text>
          
          <TextInput
            value={newTask}
            onChangeText={setNewTask}
            placeholder="What do you need to do?"
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            error={!!errorMessage}
            outlineColor={colors.primary}
            activeOutlineColor={colors.primary}
          />
          
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          
          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => {
                setModalVisible(false);
                setNewTask('');
                setErrorMessage('');
              }}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={addTask}
              style={styles.modalButton}
            >
              Add Task
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
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
  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    justifyContent: 'space-evenly',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  filterTabActive: {
    backgroundColor: colors.highlight,
  },
  filterNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.subtext,
  },
  filterTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  filterIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  // Task List
  taskList: {
    flex: 1,
  },
  taskListContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.subtext,
  },
  taskCard: {
    marginBottom: spacing.md,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  taskText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: colors.subtext,
  },
  taskDate: {
    fontSize: 12,
    color: colors.subtext,
  },
  // Empty State
  emptyStateCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginTop: spacing.xl,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  emptyStateButton: {
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
  },
  // FAB
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
  },
  // Modal
  modalContent: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    borderRadius: 20,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  snackbar: {
    backgroundColor: colors.text,
  },
});

export default TaskScreen;
