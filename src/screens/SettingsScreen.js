import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from  '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { userAPI } from '../services/api';
import { getImageUrl } from '../utils/image';
import { useTheme } from '../context/ThemeContext';
import AppearanceSettings from '../components/AppearanceSettings';
import ThemeToggle from '../components/ThemeToggle';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

const SettingsScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const { updateUserInPosts } = usePosts();
  const { theme } = useTheme();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
  });
  const [newAvatar, setNewAvatar] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const updateData = {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
      };

      if (newAvatar) {
        updateData.avatar = {
          uri: newAvatar,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        };
      }

      const response = await userAPI.updateProfile(user.id, updateData);

      if (response.success) {
        await updateUser(response.user);
        // Update avatar in all posts
        updateUserInPosts(user.id, response.user);
        setEditing(false);
        setNewAvatar(null);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={theme.primary.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('MainTabs', { screen: 'Profile' });
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings & Profile</Text>
          </View>
          <ThemeToggle />
        </LinearGradient>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
          <Image
            source={{ uri: newAvatar || getImageUrl(user?.avatar) }}
            style={styles.avatar}
          />
            {editing && (
              <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
                <LinearGradient
                  colors={theme.primary.gradient}
                  style={styles.editAvatarGradient}
                >
                  <Ionicons name="camera" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {!editing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <LinearGradient
                colors={theme.primary.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editButtonGradient}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Name</Text>
            <TextInput
              style={[
                styles.input, 
                { color: theme.text.primary, backgroundColor: theme.background.secondary },
                !editing && styles.inputDisabled
              ]}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              editable={editing}
              placeholder="Your name"
              placeholderTextColor={theme.text.tertiary}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Username</Text>
            <TextInput
              style={[
                styles.input, 
                { color: theme.text.primary, backgroundColor: theme.background.secondary },
                !editing && styles.inputDisabled
              ]}
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              editable={editing}
              placeholder="Your username"
              placeholderTextColor={theme.text.tertiary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Bio</Text>
            <TextInput
              style={[
                styles.input, 
                styles.bioInput, 
                { color: theme.text.primary, backgroundColor: theme.background.secondary },
                !editing && styles.inputDisabled
              ]}
              value={formData.bio}
              onChangeText={(value) => updateFormData('bio', value)}
              editable={editing}
              placeholder="Tell us about yourself"
              placeholderTextColor={theme.text.tertiary}
              multiline
              maxLength={200}
            />
            {editing && (
              <Text style={[styles.characterCount, { color: theme.text.secondary }]}>{formData.bio?.length || 0}/200</Text>
            )}
          </View>

          {editing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.text.secondary }]}
                onPress={() => {
                  setEditing(false);
                  setNewAvatar(null);
                  setFormData({
                    name: user?.name || '',
                    username: user?.username || '',
                    bio: user?.bio || '',
                  });
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
              >
                <LinearGradient
                  colors={theme.primary.gradient}
                  style={styles.saveButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Appearance Settings */}
        <View style={[styles.section, { backgroundColor: theme.background.card }]}>
          <AppearanceSettings />
        </View>

        {/* Account Section */}
        <View style={[styles.accountSection, { backgroundColor: theme.background.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Account</Text>

          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.status.error }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="log-out" size={32} color={theme.status.error} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Logout</Text>
            <Text style={[styles.modalMessage, { color: theme.text.secondary }]}>Are you sure you want to log out of your account?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalCancelButton, { borderColor: theme.background.tertiary, backgroundColor: theme.background.card }]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.text.primary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalLogoutButton}
                onPress={() => {
                  setLogoutModalVisible(false);
                  logout();
                }}
              >
                <LinearGradient
                  colors={theme.primary.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalLogoutGradient}
                >
                  <Text style={styles.modalLogoutText}>Yes, Logout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
  container: {
    flex: 1,
  },
  // ... (keeping all existing styles, just appending new ones)
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 2, // Extra padding at bottom to prevent cutoff
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  modalMessage: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalCancelText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  modalLogoutButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalLogoutGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLogoutText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  editAvatarGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  editButtonText: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  form: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: typography.sizes.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: typography.sizes.sm,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  saveButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  accountSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  logoutButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
});

export default SettingsScreen;
