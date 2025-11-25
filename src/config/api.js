import Constants from 'expo-constants';

// API Configuration
// For development: uses localhost
// For production: uses your deployed backend URL

const getDevelopmentUrl = () => {
  // For Android emulator, use 10.0.2.2
  // For iOS simulator and physical devices, use your computer's IP
  const platform = Constants.platform;
  
  if (platform?.android) {
    return 'http://10.0.2.2:5000';
  }
  
  // For iOS and physical devices, replace with your computer's IP
  // Example: 'http://192.168.1.100:5000'
  return 'http://localhost:5000';
};

// Change this to your deployed backend URL when ready
const PRODUCTION_URL = 'https://spark-fn9t.onrender.com';

// Automatically use development or production URL based on __DEV__
const API_URL = __DEV__ ? getDevelopmentUrl() : PRODUCTION_URL;

// Only log in development mode
if (__DEV__) {
  console.log('🌐 API_URL:', API_URL);
}

export default API_URL;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/api/auth/login`,
  REGISTER: `${API_URL}/api/auth/register`,
  
  // Users
  USERS: `${API_URL}/api/users`,
  USER_PROFILE: (userId) => `${API_URL}/api/users/${userId}`,
  USER_POSTS: (userId) => `${API_URL}/api/users/${userId}/posts`,
  FOLLOW: (userId) => `${API_URL}/api/users/${userId}/follow`,
  UNFOLLOW: (userId) => `${API_URL}/api/users/${userId}/unfollow`,
  
  // Posts
  POSTS: `${API_URL}/api/posts`,
  POST_DETAIL: (postId) => `${API_URL}/api/posts/${postId}`,
  LIKE_POST: (postId) => `${API_URL}/api/posts/${postId}/like`,
  UNLIKE_POST: (postId) => `${API_URL}/api/posts/${postId}/unlike`,
  
  // Comments
  COMMENTS: (postId) => `${API_URL}/api/posts/${postId}/comments`,
  ADD_COMMENT: `${API_URL}/api/comments`,
  
  // Notifications
  NOTIFICATIONS: `${API_URL}/api/notifications`,
  MARK_READ: (notificationId) => `${API_URL}/api/notifications/${notificationId}/read`,
};

// Socket.io URL (without /api prefix)
export const SOCKET_URL = API_URL;
