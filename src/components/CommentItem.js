import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import UserAvatar from './UserAvatar';
import CommentActions from './CommentActions';
import ReplyItem from './ReplyItem';
import { commentAPI } from '../services/api';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { spacing } from '../theme/spacing';

const CommentItem = ({ comment, currentUserId, onReply, onDelete }) => {
  const [isLiked, setIsLiked] = useState(comment.likes && comment.likes.includes(currentUserId));
  const [likesCount, setLikesCount] = useState(comment.likes ? comment.likes.length : 0);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesCount, setRepliesCount] = useState(comment.replyCount || 0);

  const handleLike = async () => {
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      if (newIsLiked) {
        await commentAPI.likeComment(comment._id);
      } else {
        await commentAPI.unlikeComment(comment._id);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
      console.error('Error liking comment:', error);
    }
  };

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0 && repliesCount > 0) {
      setLoadingReplies(true);
      try {
        const response = await commentAPI.getReplies(comment._id);
        if (response.success) {
          setReplies(response.replies);
        }
      } catch (error) {
        console.error('Error fetching replies:', error);
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const handleReplyLike = async (replyId) => {
    // This would ideally be handled within ReplyItem or by updating the specific reply in the list
    // For simplicity, we'll just force a refresh or handle it locally if we passed state down
    // But ReplyItem should probably manage its own like state for simplicity
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 7) return date.toLocaleDateString();
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainComment}>
        <UserAvatar uri={comment.user.avatar} size="small" />
        <View style={styles.content}>
          <View style={styles.bubble}>
            <Text style={styles.userName}>
              {comment.user.username || comment.user.name}
            </Text>
            <Text style={styles.commentText}>{comment.content}</Text>
          </View>
          
          <CommentActions
            timestamp={formatTime(comment.createdAt)}
            likesCount={likesCount}
            isLiked={isLiked}
            onLike={handleLike}
            onReply={() => onReply(comment)}
            onDelete={() => onDelete(comment._id)}
            canDelete={comment.user._id === currentUserId}
          />
        </View>
      </View>

      {/* View Replies Button */}
      {repliesCount > 0 && (
        <View style={styles.repliesContainer}>
          <TouchableOpacity onPress={toggleReplies} style={styles.viewRepliesButton}>
            <View style={styles.horizontalLine} />
            <Text style={styles.viewRepliesText}>
              {showReplies ? 'Hide replies' : `View ${repliesCount} more replies`}
            </Text>
          </TouchableOpacity>

          {loadingReplies && (
            <ActivityIndicator size="small" color={colors.text.light.tertiary} style={styles.loader} />
          )}

          {showReplies && (
            <View style={styles.repliesList}>
              {replies.map(reply => (
                <ReplyItem 
                  key={reply._id} 
                  reply={reply} 
                  currentUserId={currentUserId}
                  onLike={handleReplyLike} // ReplyItem needs to handle its own like state really
                  onReply={() => onReply(comment, reply.user.username)} // Reply to the main comment, tagging the user
                  onDelete={onDelete}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  mainComment: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  bubble: {
    marginBottom: 2,
  },
  userName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.light.primary,
    marginBottom: 2,
  },
  commentText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.primary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  repliesContainer: {
    marginLeft: spacing.xl + spacing.md,
    marginTop: spacing.sm,
  },
  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  horizontalLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.text.light.tertiary,
    marginRight: spacing.sm,
  },
  viewRepliesText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.light.secondary,
  },
  loader: {
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
  },
});

export default CommentItem;
