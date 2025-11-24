import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/PostCard';
import colors from '../theme/colors';
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
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.light.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {post ? (
          <PostCard 
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Post not found</Text>
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
    backgroundColor: colors.background.light.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light.tertiary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.light.primary,
  },
  content: {
    paddingVertical: spacing.sm,
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
    color: colors.text.light.secondary,
    fontSize: 16,
  },
});

export default PostDetailsScreen;
