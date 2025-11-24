const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Track online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // User joins with their user ID
    socket.on('user:online', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('user:status', { userId, online: true });
      console.log(`✅ User ${userId} is online`);
    });

    // User goes offline
    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('user:status', { userId, online: false });
          console.log(`❌ User ${userId} went offline`);
          break;
        }
      }
    });

    // New post created
    socket.on('post:created', (post) => {
      socket.broadcast.emit('post:new', post);
    });

    // Post liked
    socket.on('post:liked', (data) => {
      socket.broadcast.emit('post:like', data);
    });

    // New comment
    socket.on('comment:created', (data) => {
      socket.broadcast.emit('comment:new', data);
    });

    // New notification
    socket.on('notification:send', ({userId, notification}) => {
      const targetSocketId = onlineUsers.get(userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification:new', notification);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
