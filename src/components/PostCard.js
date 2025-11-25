import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Modal, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

import { getImageUrl } from '../utils/image';

import UserAvatar from './UserAvatar';

import { useNavigation } from '@react-navigation/native';

const PostCard = ({ post, onLike, onComment, onShare, onDelete }) => {
  const { user: currentUser } = useAuth();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const isOwnPost = currentUser && post.user && post.user.id === currentUser.id;
  
  const formatTime = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diff = now - postDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const [imageAspectRatio, setImageAspectRatio] = useState(1);

  useEffect(() => {
    if (post.image) {
      const imageUrl = getImageUrl(post.image);
      Image.getSize(imageUrl, (width, height) => {
        if (width && height) {
          setImageAspectRatio(width / height);
        }
      }, (error) => {
        console.error('Error getting image size:', error);
      });
    }
  }, [post.image]);

  const handleDelete = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const handleProfilePress = () => {
    if (post.user?._id || post.user?.id) {
      navigation.navigate('UserProfile', { userId: post.user._id || post.user.id });
    }
  };

  return (
    <View style={styles.card}>
      {/* User Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={handleProfilePress} style={styles.avatarContainer}>
            <UserAvatar 
              uri={post.user?.avatar} 
              size="small" 
              showOnline={false} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleProfilePress} style={styles.userText}>
            <Text style={styles.userName}>{post.user?.name || 'Unknown User'}</Text>
          </TouchableOpacity>
        </View>
        
        {isOwnPost && (
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Dropdown */}
      {showMenu && isOwnPost && (
        <View style={[styles.menuDropdown, { backgroundColor: theme.background.card }]}>
          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={theme.status.error} />
            <Text style={[styles.menuItemTextDelete, { color: theme.status.error }]}>Delete Post</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image if exists */}
      {post.image && (
        <Image 
          source={{ uri: getImageUrl(post.image) }} 
          style={[styles.postImage, { aspectRatio: imageAspectRatio }]}
          resizeMode="contain"
        />
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onLike && onLike(post.id || post._id)}
          >
            <Ionicons 
              name={post.isLiked ? "heart" : "heart-outline"} 
              size={26} 
              color={post.isLiked ? theme.status.error : theme.text.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onComment && onComment(post.id || post._id)}
          >
            <Ionicons name="chatbubble-outline" size={24} color={theme.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onShare && onShare(post.id || post._id)}
          >
            <Ionicons name="paper-plane-outline" size={24} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={24} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats & Content */}
      <View style={styles.contentContainer}>
        <Text style={[styles.likesText, { color: theme.text.primary }]}>
          {(() => {
            const likes = post.likes;
            if (Array.isArray(likes)) return likes.length;
            if (typeof likes === 'number') return likes;
            return 0;
          })().toLocaleString()} likes
        </Text>
        
        <View style={styles.captionContainer}>
          <Text style={[styles.captionUserName, { color: theme.text.primary }]}>{post.user?.name || 'Unknown User'}</Text>
          <Text style={[styles.captionText, { color: theme.text.primary }]}>{post.content}</Text>
        </View>

        {post.comments > 0 && (
          <TouchableOpacity onPress={() => onComment && onComment(post.id || post._id)}>
            <Text style={[styles.viewCommentsText, { color: theme.text.secondary }]}>
              View all {post.comments} comments
            </Text>
          </TouchableOpacity>
        )}
        
        <Text style={[styles.timestamp, { color: theme.text.secondary }]}>{formatTime(post.timestamp)}</Text>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background.card }]}>
            <View style={styles.modalIcon}>
              <Ionicons name="trash-outline" size={48} color={theme.status.error} />
            </View>
            
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Delete Post?</Text>
            <Text style={[styles.modalMessage, { color: theme.text.secondary }]}>
              This post will be permanently deleted. This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButtonCancel, { borderColor: theme.background.tertiary }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: theme.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonDelete}
                onPress={confirmDelete}
              >
                <LinearGradient
                  colors={['#F56565', '#E53E3E']}
                  style={styles.modalButtonDeleteGradient}
                >
                  <Text style={styles.modalButtonDeleteText}>Delete</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 0, // Instagram style often has no radius on feed
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.sm,
  },
  userText: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  postImage: {
    width: '100%',
    maxHeight: height * 0.6, // Limit height to 60% of screen height
    // height is controlled by aspectRatio
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionButton: {
    // padding: spacing.xs,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  likesText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  captionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  captionUserName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginRight: spacing.xs,
  },
  captionText: {
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
  viewCommentsText: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
  },
  menuDropdown: {
    position: 'absolute',
    top: 50,
    right: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
    zIndex: 1000,
    padding: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  menuItemTextDelete: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.lg,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  modalButtonDelete: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  modalButtonDeleteGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalButtonDeleteText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
});

export default PostCard;
