import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Import centralized API configuration
import API_URL from '../config/api';

// Smart URL detection for development and production
const getBaseUrl = () => {
  // In production mode (__DEV__ === false), use the production URL
  if (!__DEV__) {
    return `${API_URL}/api`;
  }

  // Development mode - smart detection based on platform
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  
  // Dynamic IP detection for Expo Go on physical devices
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:5000/api`;
  }

  // Android emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  
  // iOS simulator fallback
  return 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

// Only log in development mode
if (__DEV__) {
  console.log('🌐 API Service Initialized');
  console.log('📡 Mode: Development');
  console.log('🔗 URL:', BASE_URL);
}

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Only log errors in development mode, and avoid sensitive data
    if (__DEV__) {
      if (error.response) {
        // Server responded with error status
        console.error('API Error:', error.response.status, error.response.data?.message || 'Unknown error');
      } else if (error.request) {
        // Request made but no response received
        console.error('Network Error: No response from server');
      } else {
        // Error setting up the request
        console.error('Request Error:', error.message);
      }
    }

    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// User endpoints
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: async (id, data) => {
    const formData = new FormData();
    
    for (const key of Object.keys(data)) {
      if (data[key] !== undefined) {
        if (key === 'avatar' && data[key]) {
          // Handle avatar image upload
          try {
            if (Platform.OS === 'web') {
              // Web: Convert blob URL to File object if it's a blob URI
              if (data[key].uri && data[key].uri.startsWith('blob:')) {
                const response = await fetch(data[key].uri);
                const blob = await response.blob();
                const filename = 'avatar.jpg';
                const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
                formData.append('avatar', file);
              } else {
                // If it's not a blob URI (e.g. already a file or string), just append
                formData.append('avatar', data[key]);
              }
            } else {
              // Native: Append file object directly
              formData.append('avatar', data[key]);
            }
          } catch (error) {
            console.error('Error processing avatar:', error);
          }
        } else {
          formData.append(key, data[key]);
        }
      }
    }

    return api.put(`/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  followUser: (id) => api.post(`/users/${id}/follow`),
};

// Post endpoints
export const postAPI = {
  getFeed: (page = 1) => api.get(`/posts?page=${page}`),
  getPost: (id) => api.get(`/posts/${id}`),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  
  createPost: async (postData) => {
    const formData = new FormData();
    formData.append('content', postData.content);
    formData.append('type', postData.type);

    // Handle image upload
    if (postData.image) {
      try {
        if (Platform.OS === 'web') {
          // Web: Convert blob URL to File object
          const response = await fetch(postData.image);
          const blob = await response.blob();
          const filename = `image_${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
          formData.append('image', file);
        } else {
          // Native: Append file object directly
          const filename = postData.image.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          formData.append('image', {
            uri: postData.image,
            name: filename,
            type,
          });
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  sharePost: (id) => api.post(`/posts/${id}/share`),
};

// Comment endpoints
export const commentAPI = {
  getComments: (postId) => api.get(`/comments/${postId}`),
  getReplies: (commentId) => api.get(`/comments/${commentId}/replies`),
  createComment: (postId, content, parentCommentId = null) => 
    api.post(`/comments/${postId}`, { content, parentCommentId }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  updateComment: (id, content) => api.put(`/comments/${id}`, { content }),
  likeComment: (id) => api.put(`/comments/${id}/like`),
  unlikeComment: (id) => api.put(`/comments/${id}/like`), // Same endpoint toggles
};

// Notification endpoints
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
