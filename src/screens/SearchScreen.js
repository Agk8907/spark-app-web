import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
const SearchScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);

    if (searchQuery.trim().length === 0) {
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const response = await userAPI.searchUsers(searchQuery);

      if (response.success) {
        setResults(response.users || []);
        
        // Update following status from response
        const following = new Set();
        response.users.forEach(user => {
          if (user.isFollowing) {
            following.add(user.id);
          }
        });
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          following.forEach(id => newSet.add(id));
          return newSet;
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [followLoading, setFollowLoading] = useState(new Set());

  const handleUserPress = (userId) => {
    navigation.navigate('UserProfile', { userId });
  };

  const handleFollow = async (userId, e) => {
    // Prevent triggering the parent TouchableOpacity
    e?.stopPropagation();
    
    try {
      setFollowLoading(prev => new Set([...prev, userId]));
      
      const response = await userAPI.followUser(userId);
      
      if (response.success) {
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          if (response.isFollowing) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
        
        // Update the user in results to show updated follower count
        setResults(prevResults =>
          prevResults.map(user =>
            user.id === userId
              ? { ...user, followers: response.user.followers }
              : user
          )
        );
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setFollowLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const renderUser = ({ item }) => {
    const isFollowing = followingUsers.has(item.id);
    const isLoading = followLoading.has(item.id);
    
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item.id)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
          {item.bio ? (
            <Text style={styles.userBio} numberOfLines={1}>
              {item.bio}
            </Text>
          ) : null}
        </View>
        
        {/* Follow Button */}
        {user && user.id !== item.id && (
          <TouchableOpacity
            style={[
              styles.followButtonSmall,
              isFollowing && styles.followingButtonSmall,
            ]}
            onPress={(e) => handleFollow(item.id, e)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={isFollowing ? colors.text.light.primary : '#fff'} />
            ) : (
              <Text
                style={[
                  styles.followButtonTextSmall,
                  isFollowing && styles.followingButtonTextSmall,
                ]}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );

  };

  const renderTrendingTopics = () => {
    const topics = [
      { id: 1, name: '#Design', count: '2.5K posts' },
      { id: 2, name: '#Technology', count: '5.1K posts' },
      { id: 3, name: '#Photography', count: '3.8K posts' },
      { id: 4, name: '#Travel', count: '4.2K posts' },
      { id: 5, name: '#Food', count: '2.9K posts' },
    ];

    return (
      <View style={styles.trendingSection}>
        <Text style={styles.sectionTitle}>Trending Topics</Text>
        {topics.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            style={styles.topicItem}
            onPress={() => handleSearch(topic.name)}
          >
            <View>
              <Text style={styles.topicName}>{topic.name}</Text>
              <Text style={styles.topicCount}>{topic.count}</Text>
            </View>
            <Ionicons
              name="trending-up"
              size={20}
              color={colors.accent.green.main}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={colors.primary.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Search</Text>
        <Text style={styles.headerSubtitle}>Discover people and topics</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={colors.text.light.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={colors.text.light.secondary}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.text.light.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searched && query.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search-outline"
                size={64}
                color={colors.text.light.secondary}
              />
              <Text style={styles.emptyText}>No users found</Text>
              <Text style={styles.emptySubtext}>
                Try searching with a different keyword
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          ListHeaderComponent={renderTrendingTopics}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light.secondary,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.light.inverse,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.light.inverse,
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text.light.primary,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.light.primary,
    marginBottom: spacing.xs / 2,
  },
  userUsername: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.secondary,
    marginBottom: spacing.xs / 2,
  },
  userBio: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.primary,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent.green.main,
    borderWidth: 2,
    borderColor: '#fff',
  },
  trendingSection: {
    backgroundColor: '#fff',
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.light.primary,
    marginBottom: spacing.md,
  },
  topicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light.tertiary,
  },
  topicName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
    marginBottom: spacing.xs / 2,
  },
  topicCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.light.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.light.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.light.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.md,
    color: colors.text.light.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  followButtonSmall: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  followingButtonSmall: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.background.light.tertiary,
  },
  followButtonSmallText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  followingButtonSmallText: {
    color: colors.text.light.secondary,
  },
});

export default SearchScreen;
