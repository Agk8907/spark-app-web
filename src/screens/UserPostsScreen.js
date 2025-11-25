import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { postAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getImageUrl } from '../utils/image';

const { width } = Dimensions.get('window');

const UserPostsScreen = ({ route, navigation }) => {
  const { userId, userName } = route.params;
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getUserPosts(userId);
      if (response.success) {
        setPosts(response.posts || []);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary.main} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={theme.primary.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('UserProfile', { userId });
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{userName ? `${userName}'s Posts` : 'Posts'}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={[styles.postsSection, { backgroundColor: theme.background.card }]}>
          {posts.length > 0 ? (
            <View style={styles.postsGrid}>
              {posts.map((post) => (
                <TouchableOpacity
                  key={post._id || post.id}
                  style={styles.gridItem}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('PostDetails', { post })}
                >
                  {post.image ? (
                    <Image
                      source={{ uri: getImageUrl(post.image) }}
                      style={styles.gridImage}
                    />
                  ) : (
                    <View style={[styles.textPostPreview, { backgroundColor: theme.background.secondary }]}>
                      <Text style={[styles.textPostContent, { color: theme.text.primary }]} numberOfLines={3}>
                        {post.content}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noPostsContainer}>
              <Ionicons name="images-outline" size={64} color={theme.text.secondary} />
              <Text style={[styles.noPostsText, { color: theme.text.secondary }]}>No posts yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
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
  postsSection: {
    flex: 1,
    padding: spacing.xs,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -2,
  },
  gridItem: {
    width: (width - spacing.xs * 2 - 4) / 3,
    height: (width - spacing.xs * 2 - 4) / 3,
    margin: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  textPostPreview: {
    width: '100%',
    height: '100%',
    padding: spacing.sm,
    justifyContent: 'center',
  },
  textPostContent: {
    fontSize: typography.sizes.xs,
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  noPostsText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default UserPostsScreen;
