import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../config/theme';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase.client';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const ProfileScreen = ({ navigation }) => {
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState(null); // Track which field is being edited
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    neurodiversityType: [],
    primaryChallenges: [],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.display_name || '',
        email: user?.email || '',
        neurodiversityType: profile.neurodiversity_type || [],
        primaryChallenges: profile.preferences?.primary_challenges || [],
      });
    }
  }, [profile, user]);

  const handleSaveField = async (fieldName) => {
    setLoading(true);
    try {
      // Update Firestore profile
      const profileRef = doc(db, 'user_profiles', user.uid);
      
      if (fieldName === 'displayName') {
        await updateDoc(profileRef, {
          display_name: formData.displayName,
          updated_at: new Date().toISOString(),
        });
        Alert.alert('Success', 'Name updated!');
      } else if (fieldName === 'email' && !user.isAnonymous) {
        try {
          await updateEmail(auth.currentUser, formData.email);
          Alert.alert('Success', 'Email updated! Please verify your new email.');
        } catch (emailError) {
          if (emailError.code === 'auth/requires-recent-login') {
            Alert.alert(
              'Re-authentication Required',
              'For security, please log out and log back in to change your email.'
            );
          } else {
            Alert.alert('Email Update Failed', emailError.message);
          }
        }
      } else if (fieldName === 'neurodiversityType') {
        await updateDoc(profileRef, {
          neurodiversity_type: formData.neurodiversityType,
          updated_at: new Date().toISOString(),
        });
        Alert.alert('Success', 'Neurodiversity type updated!');
      } else if (fieldName === 'primaryChallenges') {
        await updateDoc(profileRef, {
          preferences: {
            ...profile?.preferences,
            primary_challenges: formData.primaryChallenges,
          },
          updated_at: new Date().toISOString(),
        });
        Alert.alert('Success', 'Challenges updated!');
      }

      setEditingField(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const challengeOptions = [
    'Time management',
    'Staying focused',
    'Organization',
    'Social situations',
    'Sensory sensitivity',
    'Memory issues',
    'Planning ahead',
    'Emotional regulation',
  ];

  const neurodiversityOptions = [
    'ADHD',
    'Autism',
    'Dyslexia',
    'Dyspraxia',
    'Other',
  ];

  const toggleChallenge = (challenge) => {
    setFormData(prev => ({
      ...prev,
      primaryChallenges: prev.primaryChallenges.includes(challenge)
        ? prev.primaryChallenges.filter(c => c !== challenge)
        : [...prev.primaryChallenges, challenge]
    }));
  };

  const toggleNeurodiversity = (type) => {
    setFormData(prev => ({
      ...prev,
      neurodiversityType: prev.neurodiversityType.includes(type)
        ? prev.neurodiversityType.filter(t => t !== type)
        : [...prev.neurodiversityType, type]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account-circle" size={80} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {formData.displayName || 'User'}
              </Text>
              <Text style={styles.profileEmail}>{formData.email}</Text>
              {user?.isAnonymous && (
                <View style={styles.guestBadge}>
                  <Text style={styles.guestBadgeText}>Guest Account</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Display Name */}
        <View style={styles.section}>
          <View style={styles.fieldHeader}>
            <Text style={styles.sectionTitle}>Display Name</Text>
            {editingField !== 'displayName' ? (
              <TouchableOpacity onPress={() => setEditingField('displayName')}>
                <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => handleSaveField('displayName')} disabled={loading}>
                <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.input, editingField !== 'displayName' && styles.inputDisabled]}
            value={formData.displayName}
            onChangeText={(text) => setFormData({ ...formData, displayName: text })}
            placeholder="Enter your name"
            editable={editingField === 'displayName'}
          />
        </View>

        {/* Email */}
        {!user?.isAnonymous && (
          <View style={styles.section}>
            <View style={styles.fieldHeader}>
              <Text style={styles.sectionTitle}>Email Address</Text>
              {editingField !== 'email' ? (
                <TouchableOpacity onPress={() => setEditingField('email')}>
                  <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => handleSaveField('email')} disabled={loading}>
                  <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.input, editingField !== 'email' && styles.inputDisabled]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={editingField === 'email'}
            />
            {editingField === 'email' && (
              <Text style={styles.helperText}>
                Changing your email requires re-verification
              </Text>
            )}
          </View>
        )}

        {/* Neurodiversity Type */}
        <View style={styles.section}>
          <View style={styles.fieldHeader}>
            <Text style={styles.sectionTitle}>Neurodiversity Type</Text>
            {editingField !== 'neurodiversityType' ? (
              <TouchableOpacity onPress={() => setEditingField('neurodiversityType')}>
                <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => handleSaveField('neurodiversityType')} disabled={loading}>
                <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.optionsGrid}>
            {neurodiversityOptions.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionChip,
                  formData.neurodiversityType.includes(type) && styles.optionChipSelected,
                  editingField !== 'neurodiversityType' && styles.optionChipDisabled,
                ]}
                onPress={() => editingField === 'neurodiversityType' && toggleNeurodiversity(type)}
                disabled={editingField !== 'neurodiversityType'}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    formData.neurodiversityType.includes(type) && styles.optionChipTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Primary Challenges */}
        <View style={styles.section}>
          <View style={styles.fieldHeader}>
            <Text style={styles.sectionTitle}>Primary Challenges</Text>
            {editingField !== 'primaryChallenges' ? (
              <TouchableOpacity onPress={() => setEditingField('primaryChallenges')}>
                <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => handleSaveField('primaryChallenges')} disabled={loading}>
                <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>What do you struggle with most?</Text>
          <View style={styles.optionsGrid}>
            {challengeOptions.map((challenge) => (
              <TouchableOpacity
                key={challenge}
                style={[
                  styles.optionChip,
                  formData.primaryChallenges.includes(challenge) && styles.optionChipSelected,
                  editingField !== 'primaryChallenges' && styles.optionChipDisabled,
                ]}
                onPress={() => editingField === 'primaryChallenges' && toggleChallenge(challenge)}
                disabled={editingField !== 'primaryChallenges'}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    formData.primaryChallenges.includes(challenge) && styles.optionChipTextSelected,
                  ]}
                >
                  {challenge}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Settings Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
            <Text style={styles.settingItemText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.subtext} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="shield-check-outline" size={24} color={colors.text} />
            <Text style={styles.settingItemText}>Privacy</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.subtext} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.text} />
            <Text style={styles.settingItemText}>Help & Support</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.subtext} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="information-outline" size={24} color={colors.text} />
            <Text style={styles.settingItemText}>About</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        <Divider style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.section}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={colors.error}
            icon="logout"
          >
            Log Out
          </Button>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 8,
  },
  guestBadge: {
    backgroundColor: colors.accent1 + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  guestBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent1,
  },
  divider: {
    marginVertical: spacing.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: colors.text,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    color: colors.subtext,
  },
  helperText: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: 4,
    fontStyle: 'italic',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionChipDisabled: {
    opacity: 0.6,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  optionChipTextSelected: {
    color: '#FFFFFF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  settingItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: colors.subtext,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  editButton: {
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  logoutButton: {
    borderRadius: 8,
    borderColor: colors.error,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProfileScreen;

