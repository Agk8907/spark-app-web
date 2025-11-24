# Spark App - Real-Time Social Media Application

A fully functional, production-ready social media application built with React Native (frontend) and Node.js/Express/MongoDB (backend), featuring real-time updates via Socket.io and cloud storage via Cloudinary.

## 🚀 Features

### Authentication

- ✅ User registration and login with JWT
- ✅ Secure password hashing with bcrypt
- ✅ Token-based authentication
- ✅ Persistent login sessions

### Posts & Feed

- ✅ Create text and image posts
- ✅ Real-time feed updates
- ✅ Like and unlike posts
- ✅ Comment on posts
- ✅ Share posts
- ✅ Delete own posts

### User Profile

- ✅ View user profiles
- ✅ Edit profile (name, username, bio)
- ✅ Upload profile avatar
- ✅ Follow/unfollow users
- ✅ View followers and following

### Real-Time Features

- ✅ Socket.io integration
- ✅ Live post updates
- ✅ Real-time notifications
- ✅ Online/offline status tracking

### Cloud Storage

- ✅ Cloudinary integration for production-ready image storage
- ✅ Automatic image optimization
- ✅ Scalable file uploads

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Cloudinary account (for image uploads)

## 🛠️ Installation

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file and configure
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spark
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STORAGE_MODE=cloud

# Start MongoDB (if using local)
mongod

# Start backend server
npm run dev
```

Server will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to project root
cd Spark

# Install dependencies
npm install

# Start Expo
npm start

# Run on platform
# iOS
npm run ios

# Android
npm run android
```

## 🎯 Getting Started

1. **Start the Backend** - Make sure MongoDB is running and start the Express server
2. **Configure Cloudinary** - Sign up at [cloudinary.com](https://cloudinary.com) and add your credentials to `.env`
3. **Start the Frontend** - Run the React Native app with Expo
4. **Register an Account** - Create a new user account through the app
5. **Start Posting** - Create posts, follow users, and enjoy real-time updates!

## 📁 Project Structure

```
Spark/
├── server/                 # Backend server
│   ├── config/            # Database and Cloud storage config
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth and upload middleware
│   └── server.js          # Main server file
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # App screens
│   ├── services/          # API and Socket.io clients
│   ├── context/           # State management
│   ├── navigation/        # Navigation setup
│   └── theme/             # Design system
└── App.js                 # Main app entry
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile (protected)
- `POST /api/users/:id/follow` - Follow/unfollow user
- `GET /api/users/search` - Search users

### Posts

- `GET /api/posts` - Get feed posts
- `POST /api/posts` - Create post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/share` - Share post

### Comments

- `GET /api/comments/:postId` - Get post comments
- `POST /api/comments/:postId` - Create comment (protected)
- `DELETE /api/comments/:id` - Delete comment (protected)

### Notifications

- `GET /api/notifications` - Get notifications (protected)
- `PUT /api/notifications/:id/read` - Mark as read

## 🎨 Tech Stack

### Frontend

- React Native with Expo
- React Navigation (Stack + Bottom Tabs)
- Axios (HTTP client)
- Socket.io Client (Real-time)
- Expo Image Picker
- AsyncStorage

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io (Real-time)
- Cloudinary (Cloud Storage)
- Multer (File Upload)
- Bcrypt (Password Hashing)

## 📸 Screenshots

The app features:

- Beautiful gradient UI design
- Modern authentication screens
- Real-time feed with post interactions
- Profile management and editing
- Instant notifications

## 🔒 Security

- Passwords hashed with bcrypt
- JWT token-based authentication
- Protected API routes
- Secure file uploads to Cloudinary
- Input validation and sanitization

## 🚢 Deployment

### Backend

- Make sure to set environment variables
- Use MongoDB Atlas for production database

### Frontend

- Build with Expo EAS for iOS/Android
- Or use Expo Go for development testing

## 📝 License

This project is for educational and demonstration purposes.

---

**Built with ❤️ using React Native, Node.js, and Cloudinary**
