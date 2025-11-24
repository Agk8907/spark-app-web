const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users by username or name
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
    }).limit(20);

    // Check if current user is following these users
    let followingSet = new Set();
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        if (currentUser) {
          followingSet = new Set(currentUser.following.map(id => id.toString()));
        }
      } catch (err) {
        // Invalid token, continue without auth info
      }
    }

    const usersWithFollowStatus = users.map(user => ({
      ...user.getPublicProfile(),
      isFollowing: followingSet.has(user._id.toString()),
    }));

    res.json({
      success: true,
      users: usersWithFollowStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public (but returns isFollowing if authenticated)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's posts
    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'username name avatar');

    // Check if current user is following this user (if authenticated)
    let isFollowing = false;
    let isOwnProfile = false;
    
    // Try to get current user from token (optional auth)
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        
        if (currentUser) {
          isFollowing = currentUser.following.some(
            id => id.toString() === req.params.id
          );
          isOwnProfile = currentUser._id.toString() === req.params.id;
        }
      } catch (err) {
        // Invalid token, just continue without auth
      }
    }

    res.json({
      success: true,
      user: user.getPublicProfile(),
      posts,
      isFollowing,
      isOwnProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, upload.single('avatar'), async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile',
      });
    }

    const { name, bio, username } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (username) updateData.username = username;

    // If avatar file was uploaded (local or Cloudinary)
    if (req.file) {
      updateData.avatar = process.env.STORAGE_MODE === 'cloud'
        ? req.file.path  // Cloudinary URL
        : `/uploads/${req.file.filename}`; // Local path
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow/Unfollow a user
// @access  Private
router.post('/:id/follow', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Can't follow yourself
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    const isFollowing = currentUser.following.some(
      id => id.toString() === targetUserId
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );

      // Decrement counts
      currentUser.followingCount = Math.max(0, (currentUser.followingCount || 0) - 1);
      targetUser.followersCount = Math.max(0, (targetUser.followersCount || 0) - 1);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUser._id);

      // Increment counts
      currentUser.followingCount = (currentUser.followingCount || 0) + 1;
      targetUser.followersCount = (targetUser.followersCount || 0) + 1;

      // Create notification
      await Notification.create({
        user: targetUserId,
        type: 'follow',
        fromUser: currentUser._id,
      });
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followersCount,
      followingCount: currentUser.followingCount,
      user: targetUser.getPublicProfile(),
    });
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
