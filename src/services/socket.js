import io from 'socket.io-client';

import { Platform } from 'react-native';
import { SOCKET_URL } from '@env';

const getSocketUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000';
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
  return SOCKET_URL || 'http://localhost:5000';
};

const BASE_URL = getSocketUrl();

class SocketService {
  socket = null;

  connect(userId) {
    if (!this.socket) {
      this.socket = io(BASE_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected');
        if (userId) {
          this.socket.emit('user:online', userId);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
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
