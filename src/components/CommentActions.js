import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { spacing } from '../theme/spacing';

const CommentActions = ({ 
  likesCount, 
  isLiked, 
  onLike, 
  onReply, 
  onDelete,
  canDelete,
  timestamp,
  isReplied,
  replyCount
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftActions}>
        <Text style={styles.timestamp}>{timestamp}</Text>
        
        {likesCount > 0 && (
          <Text style={styles.likesCount}>
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </Text>
        )}
        
        <TouchableOpacity onPress={onReply} style={styles.actionButton}>
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>

        {canDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
             <Ionicons name="trash-outline" size={14} color={colors.text.light.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={onLike} style={styles.likeButton}>
        <Ionicons 
          name={isLiked ? "heart" : "heart-outline"} 
          size={14} 
          color={isLiked ? colors.status.error : colors.text.light.tertiary} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingRight: spacing.sm,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.light.tertiary,
  },
  likesCount: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.light.secondary,
  },
  actionButton: {
    paddingVertical: 2,
  },
  actionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.light.secondary,
  },
  likeButton: {
    padding: 4,
  },
});

export default CommentActions;
