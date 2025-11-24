import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';
import { API_URL } from '@env';

import Constants from 'expo-constants';

// Smart URL detection
const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  
  // Dynamic IP detection for Expo Go on physical devices
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:5000/api`;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
  return API_URL || 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

console.log('API Service Initialized with URL:', BASE_URL);

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
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request (No Response):', error.request);
      console.error('API Error Request Details:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error Message:', error.message);
    }
    console.error('API Error Config:', error.config);

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
  updateProfile: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
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
