import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import AppearanceSettings from '../components/AppearanceSettings';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI } from '../services/api';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';
import CommentsModal from '../components/CommentsModal';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getImageUrl } from '../utils/image';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { deletePost, likePost } = usePosts();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [appearanceVisible, setAppearanceVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Refresh profile when screen comes into focus (e.g., after settings update)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchProfile();
      }
    }, [user])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile(user.id);
      
      if (response.success) {
        setUserProfile(response.user);
      }

      // Fetch user's posts
      const postsResponse = await postAPI.getUserPosts(user.id);
      if (postsResponse.success) {
        setUserPosts(postsResponse.posts || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      // Remove from local state
      setUserPosts(prev => prev.filter(post => (post.id || post._id) !== postId));
      console.log('Post deleted from profile');
    } catch (error) {
      console.error('Error deleting post from profile:', error);
    }
  };

  const handleLike = async (postId) => {
    await likePost(postId);
    // Update local state
    setUserPosts(prev => prev.map(post => {
      if ((post.id || post._id) === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleComment = (postId) => {
    setSelectedPostId(postId);
    setCommentsVisible(true);
  };

  const handleShare = (postId) => {
    console.log('Share post:', postId);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary.main} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const profile = userProfile || user;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={theme.primary.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Image source={{ uri: getImageUrl(profile.avatar) }} style={styles.avatar} />
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => setMenuVisible(true)}
              >
                <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Profile Info */}
        <View style={[styles.profileInfo, { backgroundColor: theme.background.card }]}>
          <Text style={[styles.name, { color: theme.text.primary }]}>{profile.name}</Text>
          <Text style={[styles.username, { color: theme.text.secondary }]}>@{profile.username}</Text>
          {profile.bio && <Text style={[styles.bio, { color: theme.text.primary }]}>{profile.bio}</Text>}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{userPosts.length || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Posts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.background.tertiary }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{profile.followersCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{profile.followingCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Following</Text>
            </View>
          </View>
        </View>

        {/* Posts Section */}
        <View style={[styles.postsSection, { backgroundColor: theme.background.card }]}>
          <View style={styles.postsSectionHeader}>
            <Ionicons name="grid-outline" size={24} color={theme.primary.main} />
            <Text style={[styles.postsSectionTitle, { color: theme.text.primary }]}>My Posts</Text>
          </View>

          {userPosts.length > 0 ? (
            <View>
              {userPosts.map((post) => (
                <PostCard
                  key={post.id || post._id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                  onDelete={handleDeletePost}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={64} color={theme.text.tertiary} />
              <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>No posts yet</Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.text.tertiary }]}>
                Share your first post and it will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <CommentsModal
        visible={commentsVisible}
        postId={selectedPostId}
        onClose={() => setCommentsVisible(false)}
      />

      {/* Dropdown Menu Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View style={[styles.menuContainer, { backgroundColor: theme.background.card }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setAppearanceVisible(true);
                }}
              >
                <Ionicons name="color-palette-outline" size={20} color={theme.text.primary} />
                <Text style={[styles.menuText, { color: theme.text.primary }]}>Appearance</Text>
              </TouchableOpacity>
              
              <View style={[styles.menuDivider, { backgroundColor: theme.background.tertiary }]} />
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setLogoutModalVisible(true);
                }}
              >
                <Ionicons name="log-out-outline" size={20} color={theme.status.error} />
                <Text style={[styles.menuText, { color: theme.status.error }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Appearance Settings Modal */}
      <Modal
        visible={appearanceVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAppearanceVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background.secondary }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.background.card }]}>
            <Text style={[styles.modalHeaderTitle, { color: theme.text.primary }]}>Appearance</Text>
            <TouchableOpacity onPress={() => setAppearanceVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <AppearanceSettings />
          </ScrollView>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={[styles.logoutModalContent, { backgroundColor: theme.background.card }]}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out" size={32} color={theme.status.error} />
            </View>
            <Text style={[styles.logoutTitle, { color: theme.text.primary }]}>Logout</Text>
            <Text style={[styles.logoutMessage, { color: theme.text.secondary }]}>
              Are you sure you want to log out?
            </Text>
            
            <View style={styles.logoutButtons}>
              <TouchableOpacity 
                style={[styles.logoutCancelButton, { borderColor: theme.background.tertiary }]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={[styles.logoutCancelText, { color: theme.text.primary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.logoutConfirmButton, { backgroundColor: theme.status.error }]}
                onPress={() => {
                  setLogoutModalVisible(false);
                  logout();
                }}
              >
                <Text style={styles.logoutConfirmText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  profileInfo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    marginTop: -spacing.xxl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  name: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'transparent', // Handled dynamically
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
  },
  postsSection: {
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  postsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  postsSectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
  },
  // Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    minWidth: 180,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  menuText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.sm,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: spacing.sm,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalHeaderTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  modalContent: {
    padding: spacing.lg,
  },
  // Logout Modal Styles
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logoutModalContent: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  logoutIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoutTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  logoutMessage: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  logoutButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  logoutCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  logoutCancelText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  logoutConfirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  logoutConfirmText: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});

export default ProfileScreen;
