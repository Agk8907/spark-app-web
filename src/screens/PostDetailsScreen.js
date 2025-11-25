import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/PostCard';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { commentAPI, postAPI } from '../services/api';
import CommentsModal from '../components/CommentsModal';

const PostDetailsScreen = ({ route, navigation }) => {
  const { post: initialPost, postId } = route.params;
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();

  // If we only have postId, we might need to fetch the post (not implemented in API yet, but good for future)
  // For now, we assume post object is passed or we display what we have
  
  useEffect(() => {
    if (!post && postId) {
      // Placeholder for fetching post by ID if needed
      // fetchPost(postId);
      setLoading(false); 
    }
  }, [postId, post]);

  const handleLike = async (id) => {
    const isLiked = post.isLiked;
    const currentLikes = post.likes;
    
    // Optimistic update
    let newLikes;
    if (Array.isArray(currentLikes)) {
        newLikes = isLiked ? currentLikes.length - 1 : currentLikes.length + 1;
    } else {
        newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
    }

    setPost(prev => ({
      ...prev,
      isLiked: !isLiked,
      likes: newLikes
    }));

    try {
      const response = await postAPI.likePost(id);
      if (response.success) {
          setPost(prev => ({
              ...prev,
              isLiked: response.isLiked,
              likes: response.likes
          }));
      }
    } catch (error) {
      // Revert
      setPost(prev => ({
        ...prev,
        isLiked: isLiked,
        likes: currentLikes
      }));
      console.error('Error liking post:', error);
    }
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const handleShare = (id) => {
    // Share logic
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.background.card, borderBottomColor: theme.background.tertiary }]}>
        <TouchableOpacity 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Feed');
            }
          }} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
      >
        {post ? (
          <PostCard 
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.text.secondary }]}>Post not found</Text>
          </View>
        )}
      </ScrollView>

      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={post?.id || post?._id}
        user={user}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flexGrow: 1,
    paddingVertical: spacing.sm,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});

export default PostDetailsScreen;
