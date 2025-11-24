import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UserAvatar from './UserAvatar';
import CommentActions from './CommentActions';
import { commentAPI } from '../services/api';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { spacing } from '../theme/spacing';

const ReplyItem = ({ 
  reply, 
  currentUserId, 
  onDelete, 
  onReply 
}) => {
  const [isLiked, setIsLiked] = useState(reply.likes && reply.likes.includes(currentUserId));
  const [likesCount, setLikesCount] = useState(reply.likes ? reply.likes.length : 0);
  const canDelete = reply.user._id === currentUserId;

  const handleLike = async () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      if (newIsLiked) {
        await commentAPI.likeComment(reply._id);
      } else {
        await commentAPI.unlikeComment(reply._id);
      }
    } catch (error) {
      setIsLiked(!newIsLiked);
      setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
      console.error('Error liking reply:', error);
    }
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
      <UserAvatar uri={reply.user.avatar} size="xs" />
      <View style={styles.content}>
        <View style={styles.bubble}>
          <Text style={styles.userName}>
            {reply.user.username || reply.user.name}
          </Text>
          <Text style={styles.commentText}>{reply.content}</Text>
        </View>
        
        <CommentActions
          timestamp={formatTime(reply.createdAt)}
          likesCount={likesCount}
          isLiked={isLiked}
          onLike={handleLike}
          onReply={onReply}
          onDelete={() => onDelete(reply._id)}
          canDelete={canDelete}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingLeft: spacing.md, // Indent replies
  },
  content: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  bubble: {
    marginBottom: 2,
  },
  userName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.light.primary,
    marginBottom: 2,
  },
  commentText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.primary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
});

export default ReplyItem;
