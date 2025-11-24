import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentItem from './CommentItem';
import UserAvatar from './UserAvatar';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import EmojiPicker from './EmojiPicker';

const CommentsModal = ({ visible, postId, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [slideAnim] = useState(new Animated.Value(0));
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      fetchComments();
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setReplyingTo(null);
      setNewComment('');
      setShowEmojiPicker(false);
    }
  }, [visible, postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getComments(postId);
      if (response.success) {
        setComments(response.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (comment, username) => {
    setReplyingTo(comment);
    setNewComment(username ? `@${username} ` : '');
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
    Keyboard.dismiss();
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await commentAPI.deleteComment(commentId);
      if (response.success) {
        setComments(comments.filter(c => c._id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const content = newComment.trim();
      const parentId = replyingTo ? replyingTo._id : null;

      const response = await commentAPI.createComment(postId, content, parentId);

      if (response.success) {
        if (parentId) {
           fetchComments(); 
        } else {
           setComments([response.comment, ...comments]);
        }
        setNewComment('');
        setReplyingTo(null);
        setShowEmojiPicker(false);
        Keyboard.dismiss();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewComment(prev => prev + emoji);
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ translateY }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerBar} />
            <Text style={styles.headerTitle}>Comments</Text>
            <View style={styles.headerRight} /> 
          </View>

          {/* Comments List */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <CommentItem 
                    comment={item} 
                    currentUserId={user?.id || user?._id}
                    onReply={handleReply}
                    onDelete={handleDeleteComment}
                  />
                )}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubble-outline" size={64} color={colors.text.light.secondary} />
                    <Text style={styles.emptyText}>No comments yet</Text>
                    <Text style={styles.emptySubtext}>Start the conversation.</Text>
                  </View>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}

            {/* Reply Indicator */}
            {replyingTo && (
              <View style={styles.replyingContainer}>
                <Text style={styles.replyingText}>
                  Replying to <Text style={styles.replyingName}>
                    {replyingTo.user.username || replyingTo.user.name}
                  </Text>
                </Text>
                <TouchableOpacity onPress={cancelReply}>
                  <Ionicons name="close-circle" size={20} color={colors.text.light.secondary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Input Section */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    if (!showEmojiPicker) Keyboard.dismiss();
                  }}
                  style={styles.emojiButton}
                >
                  <Ionicons 
                    name={showEmojiPicker ? "keypad-outline" : "happy-outline"} 
                    size={24} 
                    color={colors.text.light.primary} 
                  />
                </TouchableOpacity>
                
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder={replyingTo ? "Reply to comment..." : "Add a comment..."}
                  placeholderTextColor={colors.text.light.secondary}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  maxLength={500}
                  onFocus={() => setShowEmojiPicker(false)}
                />
                
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!newComment.trim() || submitting}
                  style={styles.postButton}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.primary.main} />
                  ) : (
                    <Text style={[
                      styles.postButtonText,
                      (!newComment.trim()) && styles.postButtonDisabled
                    ]}>
                      Post
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {showEmojiPicker && (
                <EmojiPicker onSelect={handleEmojiSelect} />
              )}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '90%', // Increased height
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.background.light.tertiary,
  },
  headerBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.background.light.tertiary,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.light.primary,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for input
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.light.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.md,
    color: colors.text.light.secondary,
    marginTop: spacing.xs,
  },
  replyingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.light.secondary,
    borderTopWidth: 0.5,
    borderTopColor: colors.background.light.tertiary,
  },
  replyingText: {
    fontSize: typography.sizes.xs,
    color: colors.text.light.secondary,
  },
  replyingName: {
    fontWeight: typography.weights.bold,
    color: colors.text.light.primary,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.background.light.tertiary,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Safe area adjustment
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  emojiButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.light.primary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.light.secondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.background.light.tertiary,
    marginRight: spacing.sm,
  },
  postButton: {
    marginBottom: 8,
    paddingHorizontal: spacing.xs,
  },
  postButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  postButtonDisabled: {
    opacity: 0.5,
    color: colors.primary.light,
  },
});

export default CommentsModal;
