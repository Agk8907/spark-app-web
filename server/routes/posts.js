const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (feed) - shows posts from followed users + own posts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get current user's following list
    const currentUser = await User.findById(req.user._id);
    const followingIds = currentUser.following;

    // Include own posts + posts from people you follow
    const feedUserIds = [req.user._id, ...followingIds];

    const posts = await Post.find({ user: { $in: feedUserIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username name avatar isOnline');

    // Format posts to match frontend structure
    const formattedPosts = posts.map(post => ({
      id: post._id,
      userId: post.user._id,
      user: {
        id: post.user._id,
        username: post.user.username,
        name: post.user.name,
        avatar: post.user.avatar,
        isOnline: post.user.isOnline,
      },
      type: post.type,
      content: post.content,
      image: post.image,
      timestamp: post.createdAt,
      likes: post.likes.length,
      comments: post.commentsCount,
      shares: post.shares,
      isLiked: post.likes.includes(req.user._id),
    }));

    res.json({
      success: true,
      posts: formattedPosts,
      page,
      totalPages: Math.ceil(await Post.countDocuments({ user: { $in: feedUserIds } }) / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username name avatar isOnline');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user ID (for profile view)
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username name avatar isOnline')
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map(post => ({
      id: post._id,
      userId: post.user._id,
      user: {
        id: post.user._id,
        username: post.user.username,
        name: post.user.name,
        avatar: post.user.avatar,
        isOnline: post.user.isOnline,
      },
      type: post.type,
      content: post.content,
      image: post.image,
      timestamp: post.createdAt,
      likes: post.likes.length,
      comments: post.commentsCount || 0,
      shares: post.shares || 0,
      isLiked: post.likes.includes(req.user._id),
    }));

    res.json({
      success: true,
      posts: formattedPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { content, type } = req.body;

    const postData = {
      user: req.user._id,
      content,
      type: type || 'text',
    };

    // If image file was uploaded (local or Cloudinary)
    if (req.file) {
      // For local storage: create accessible URL path
      // For Cloudinary: req.file.path already contains the full URL
      postData.image = process.env.STORAGE_MODE === 'cloud' 
        ? req.file.path  // Cloudinary URL
        : `/uploads/${req.file.filename}`; // Local path
      postData.type = 'image';
    }

    const post = await Post.create(postData);
    await post.populate('user', 'username name avatar isOnline');

    // Increment user's post count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { postsCount: 1 },
    });

    // Format post to match feed format
    const formattedPost = {
      id: post._id,
      userId: post.user._id,
      user: {
        id: post.user._id,
        username: post.user.username,
        name: post.user.name,
        avatar: post.user.avatar,
        isOnline: post.user.isOnline,
      },
      type: post.type,
      content: post.content,
      image: post.image,
      timestamp: post.createdAt,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    };

    res.status(201).json({
      success: true,
      post: formattedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    await post.deleteOne();

    // Decrement user's post count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { postsCount: -1 },
    });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push(req.user._id);

      // Create notification if not own post
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: post.user,
          type: 'like',
          fromUser: req.user._id,
          post: post._id,
        });
      }
    }

    await post.save();

    res.json({
      success: true,
      isLiked: !isLiked,
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/posts/:id/share
// @desc    Share a post
// @access  Private
router.post('/:id/share', protect, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    res.json({
      success: true,
      shares: post.shares,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
