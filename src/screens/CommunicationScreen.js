import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  TextInput,
  List,
  FAB,
  Portal,
  Modal,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../config/theme';

const CommunicationScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newTemplate, setNewTemplate] = useState('');
  const [templates, setTemplates] = useState([
    {
      id: '1',
      title: 'Need a Break',
      text: 'I need to take a short break to recharge. I\'ll be back shortly.',
      category: 'work'
    },
    {
      id: '2',
      title: 'Overwhelmed',
      text: 'I\'m feeling overwhelmed right now and need some space to process.',
      category: 'social'
    },
    {
      id: '3',
      title: 'Sensory Overload',
      text: 'I\'m experiencing sensory overload and need a quiet environment.',
      category: 'emergency'
    }
  ]);

  const addTemplate = () => {
    if (newTemplate.trim()) {
      const template = {
        id: Date.now().toString(),
        title: 'New Template',
        text: newTemplate.trim(),
        category: 'general'
      };
      setTemplates([template, ...templates]);
      setNewTemplate('');
      setModalVisible(false);
    }
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'work', label: 'Work' },
    { key: 'social', label: 'Social' },
    { key: 'emergency', label: 'Emergency' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Title style={styles.title}>Communication Templates</Title>
        <Paragraph style={styles.subtitle}>
          Pre-written messages to help you communicate effectively
        </Paragraph>

        {templates.map((template) => (
          <Card key={template.id} style={styles.card}>
            <Card.Content>
              <Title style={styles.templateTitle}>{template.title}</Title>
              <Paragraph style={styles.templateText}>{template.text}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button mode="outlined" onPress={() => {}}>
                Copy
              </Button>
              <Button mode="contained" onPress={() => {}}>
                Use
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Add New Template</Title>
          <TextInput
            value={newTemplate}
            onChangeText={setNewTemplate}
            placeholder="Enter your communication template..."
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={addTemplate}>
              Add Template
            </Button>
          </View>
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
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  templateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  templateText: {
    fontSize: typography.sizes.md,
    color: colors.subtext,
    marginTop: spacing.xs,
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
  },
  modalTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  input: {
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CommunicationScreen;