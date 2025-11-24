require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeSocket } = require('./config/socket');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');

// Initialize app
const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Initialize Socket.io
initializeSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for local storage mode
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SocialFeedApp API Server is running!',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    const storageMode = process.env.STORAGE_MODE === 'cloud' ? '☁️  Cloudinary (Active)' : '💾  Local Disk (Active)';
    console.log(`
╔════════════════════════════════════════════╗
║   🚀 SocialFeedApp Server Running!        ║
║   📡 Port: ${PORT}                           ║
║   🌐 http://localhost:${PORT}                ║
║   📦 Storage: ${storageMode}        ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = server;
