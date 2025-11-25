import io from 'socket.io-client';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Import the same API URL logic
const getDevelopmentUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }
  
  // Dynamic IP detection for Expo Go on physical devices
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:5000`;
  }

  // Android emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  
  // iOS simulator fallback
  return 'http://localhost:5000';
};

// Production URL - matches your deployed Render backend
const PRODUCTION_URL = 'https://spark-fn9t.onrender.com';

// Automatically use development or production URL based on __DEV__
const BASE_URL = __DEV__ ? getDevelopmentUrl() : PRODUCTION_URL;

// Only log in development mode
if (__DEV__) {
  console.log('🔌 Socket URL:', BASE_URL);
}

class SocketService {
  socket = null;

  connect(userId) {
    if (!this.socket) {
      this.socket = io(BASE_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        if (__DEV__) {
          console.log('✅ Socket connected');
        }
        if (userId) {
          this.socket.emit('user:online', userId);
        }
      });

      this.socket.on('disconnect', () => {
        if (__DEV__) {
          console.log('❌ Socket disconnected');
        }
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emit events
  emitPostCreated(post) {
    if (this.socket) {
      this.socket.emit('post:created', post);
    }
  }

  emitPostLiked(data) {
    if (this.socket) {
      this.socket.emit('post:liked', data);
    }
  }

  emitCommentCreated(data) {
    if (this.socket) {
      this.socket.emit('comment:created', data);
    }
  }

  sendNotification(userId, notification) {
    if (this.socket) {
      this.socket.emit('notification:send', { userId, notification });
    }
  }

  // Listen to events
  onNewPost(callback) {
    if (this.socket) {
      this.socket.on('post:new', callback);
    }
  }

  onPostLike(callback) {
    if (this.socket) {
      this.socket.on('post:like', callback);
    }
  }

  onNewComment(callback) {
    if (this.socket) {
      this.socket.on('comment:new', callback);
    }
  }

  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('notification:new', callback);
    }
  }

  onUserStatus(callback) {
    if (this.socket) {
      this.socket.on('user:status', callback);
    }
  }

  // Remove listeners
  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
