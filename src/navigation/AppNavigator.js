import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main Screens
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';
import UserPostsScreen from '../screens/UserPostsScreen';

// Context
import { useAuth } from '../context/AuthContext';

import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => {
  const { theme } = useTheme();
  
  return (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Feed') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Search') {
          iconName = focused ? 'search' : 'search-outline';
        } else if (route.name === 'Notifications') {
          iconName = focused ? 'notifications' : 'notifications-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.primary.main,
      tabBarInactiveTintColor: theme.text.secondary,
      tabBarStyle: {
        backgroundColor: theme.background.card,
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen name="Feed" component={FeedScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
  );
};

// Main Stack with Modals
const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreatePost"
      component={CreatePostScreen}
      options={{
        headerShown: false,
        presentation: 'modal',
      }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="UserProfile"
      component={UserProfileScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="PostDetails"
      component={PostDetailsScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="UserPosts"
      component={UserPostsScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer
      linking={{
        prefixes: ['socialfeed://', 'http://localhost:19006'],
        config: {
          screens: {
            Login: 'login',
            Register: 'register',
            MainTabs: {
              screens: {
                Feed: 'feed',
                Search: 'search',
                Notifications: 'notifications',
                Profile: 'profile',
              },
            },
            Settings: 'settings',
            CreatePost: 'create-post',
            CreatePost: 'create-post',
            UserProfile: 'user/:userId',
            UserPosts: 'user/:userId/posts',
          },
        },
      }}
    >
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
