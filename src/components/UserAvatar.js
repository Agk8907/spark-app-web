import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { borderRadius } from '../theme/spacing';
import { getImageUrl } from '../utils/image';

const UserAvatar = ({ uri, size = 'medium', showOnline = false, isOnline = false }) => {
  const sizes = {
    small: 32,
    medium: 44,
    large: 60,
    xlarge: 80,
    xs: 24, // Added xs size for replies
  };

  const avatarSize = sizes[size] || sizes.medium;

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }]}>
      <Image 
        source={{ uri: getImageUrl(uri) }} 
        style={[styles.avatar, { width: avatarSize, height: avatarSize }]} 
      />
      {showOnline && isOnline && (
        <View style={[
          styles.onlineIndicator,
          { 
            width: avatarSize * 0.25, 
            height: avatarSize * 0.25,
            borderRadius: avatarSize * 0.125,
          }
        ]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary.light,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.accent.green,
    borderWidth: 2,
    borderColor: colors.background.light.card,
  },
});

export default UserAvatar;
