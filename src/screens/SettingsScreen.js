import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { userAPI } from '../services/api';
import { getImageUrl } from '../utils/image';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

const { width, height } = Dimensions.get('window');

const SettingsScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { updateUserInPosts } = usePosts();
  const { theme } = useTheme();
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
        updateUserInPosts(user.id, response.user);
        setNewAvatar(null);
        Alert.alert('Success', 'Profile updated successfully!');
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('MainTabs', { screen: 'Profile' });
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      {/* Header */}
      <LinearGradient
        colors={theme.primary.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : 20 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                // Fallback to Profile if we can't go back (e.g. refresh on web)
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.headerSaveButton}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.headerSaveText}>Save</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Main Content Area */}
      <KeyboardWrapper>
        <ScrollView
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: newAvatar || getImageUrl(user?.avatar) }}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
                  <LinearGradient
                    colors={theme.primary.gradient}
                    style={styles.editAvatarGradient}
                  >
                    <Ionicons name="camera" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <Text style={[styles.changePhotoText, { color: theme.primary.main }]}>
                Change Profile Photo
              </Text>
            </View>

            {/* Profile Form */}
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text.secondary }]}>Name</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { color: theme.text.primary, backgroundColor: theme.background.card }
                  ]}
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  placeholder="Your name"
                  placeholderTextColor={theme.text.tertiary}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text.secondary }]}>Username</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { color: theme.text.primary, backgroundColor: theme.background.card }
                  ]}
                  value={formData.username}
                  onChangeText={(value) => updateFormData('username', value)}
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
                    { color: theme.text.primary, backgroundColor: theme.background.card }
                  ]}
                  value={formData.bio}
                  onChangeText={(value) => updateFormData('bio', value)}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={theme.text.tertiary}
                  multiline
                  maxLength={200}
                />
                <Text style={[styles.characterCount, { color: theme.text.secondary }]}>
                  {formData.bio?.length || 0}/200
                </Text>
              </View>
            </View>
          </View>
          
          {/* Spacer for keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardWrapper>

      {/* Sticky Save Button Footer */}
      <View style={[styles.footer, { backgroundColor: theme.background.secondary, borderTopColor: theme.background.tertiary }]}>
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
    </View>
  );
};

const KeyboardWrapper = ({ children }) => {
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1, width: '100%' }}>{children}</View>;
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web: {
        height: '100vh',
        overflow: 'hidden',
      },
      default: {
        height: '100%',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    zIndex: 10,
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  headerSaveButton: {
    padding: spacing.sm,
  },
  headerSaveText: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  contentContainer: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: Math.min(width * 0.35, 150), // Responsive width, max 150
    height: Math.min(width * 0.35, 150), // Responsive height, max 150
    borderRadius: Math.min(width * 0.35, 150) / 2,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editAvatarGradient: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
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
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: typography.sizes.sm,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  saveButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  saveButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});

export default SettingsScreen;
