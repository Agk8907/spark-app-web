import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePosts } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [image, setImage] = useState(null);
  const { theme } = useTheme();
  
  // Safely get posts context
  let createPost, loading;
  try {
    const postsContext = usePosts();
    createPost = postsContext.createPost;
    loading = postsContext.loading;
  } catch (error) {
    console.error('PostsContext error:', error);
    // Fallback if context is not available
    createPost = async () => ({ success: false, error: 'Context not available' });
    loading = false;
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setType('image');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something');
      return;
    }

    try {
      const postData = {
        content: content.trim(),
        type,
        image,
      };

      const result = await createPost(postData);

      if (result.success) {
        // Close screen immediately after successful post
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('MainTabs', { screen: 'Feed' });
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Create post error:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
    }
  };

  const removeImage = () => {
    setImage(null);
    setType('text');
  };

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Feed' });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={theme.primary.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity 
            onPress={handleCreatePost} 
            disabled={loading || !content.trim()}
            style={styles.headerButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={[
                styles.postButtonContainer,
                (!content.trim()) && styles.postButtonDisabled,
              ]}>
                <Text style={styles.postButton}>Post</Text>
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Text Input with Card Style */}
          <View style={[styles.textInputCard, { backgroundColor: theme.background.card }]}>
            <TextInput
              style={[styles.textInput, { color: theme.text.primary }]}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.text.secondary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={2000}
              autoFocus
            />
            {/* Character Counter */}
            <View style={styles.characterCountContainer}>
              <Text style={[styles.characterCount, { color: theme.text.secondary }]}>
                {content.length}/2000
              </Text>
            </View>
          </View>

          {/* Image Preview with Modern Card */}
          {image && (
            <View style={[styles.imagePreviewCard, { backgroundColor: theme.background.card }]}>
              <Image 
                source={{ uri: image }} 
                style={styles.imagePreview} 
                resizeMode="contain" 
              />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={removeImage}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
                  style={styles.removeButtonGradient}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Toolbar with Elevated Card */}
        <View style={[styles.toolbarContainer, { backgroundColor: theme.background.secondary }]}>
          <View style={[styles.toolbar, { backgroundColor: theme.background.card }]}>
            <TouchableOpacity style={styles.toolbarButton} onPress={pickImage}>
              <LinearGradient
                colors={['#4FD1C5', '#38B2AC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.toolbarButtonGradient}
              >
                <Ionicons name="image-outline" size={24} color="#fff" />
                <Text style={styles.toolbarButtonText}>Add Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  postButtonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  postButton: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  postButtonDisabled: {
    opacity: 0.4,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  textInputCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 180,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  textInput: {
    fontSize: typography.sizes.lg,
    lineHeight: 26,
    minHeight: 120,
  },
  characterCountContainer: {
    marginTop: spacing.sm,
    alignItems: 'flex-end',
  },
  characterCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  imagePreviewCard: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  imagePreview: {
    width: '100%',
    height: 250,
    maxHeight: 300,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  removeButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarContainer: {
    padding: spacing.lg,
  },
  toolbar: {
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px -1px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  toolbarButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  toolbarButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
});

export default CreatePostScreen;
