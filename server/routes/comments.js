const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts/:postId/comments
// @desc    Get comments for a post (top-level only)
// @access  Public
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      post: req.params.postId,
      parentComment: null 
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username name avatar')
      .populate('replyCount');

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/comments/:commentId/replies
// @desc    Get replies for a comment
// @access  Public
router.get('/:commentId/replies', async (req, res) => {
  try {
    const replies = await Comment.find({ parentComment: req.params.commentId })
      .sort({ createdAt: 1 }) // Oldest first for replies usually
      .populate('user', 'username name avatar');

    res.json({
      success: true,
      replies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/posts/:postId/comments
// @desc    Create a comment on a post
// @access  Private
router.post('/:postId', protect, async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = await Comment.create({
      post: req.params.postId,
      user: req.user._id,
      content,
      parentComment: parentCommentId || null,
    });

    await comment.populate('user', 'username name avatar');
    
    // If it's a reply, we might want to notify the parent comment author
    if (parentCommentId) {
       const parentComment = await Comment.findById(parentCommentId);
       if (parentComment && parentComment.user.toString() !== req.user._id.toString()) {
          await Notification.create({
            user: parentComment.user,
            type: 'reply', // You might need to add this type to your Notification model enum if strict
            fromUser: req.user._id,
            post: post._id,
            comment: comment._id
          });
       }
    }

    // Increment post's comment count only for top-level comments or all? 
    // Usually all comments count towards the post's total
    await Post.findByIdAndUpdate(req.params.postId, {
      $inc: { commentsCount: 1 },
    });

    // Create notification for post owner if not own post
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.user,
        type: 'comment',
        fromUser: req.user._id,
        post: post._id,
        comment: comment._id
      });
    }

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { content } = req.body;
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Check user ownership
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content, isEdited: true },
      { new: true }
    ).populate('user', 'username name avatar');

    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/comments/:id/like
// @desc    Like/Unlike a comment
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Check if already liked
    if (comment.likes.includes(req.user._id)) {
      // Unlike
      const index = comment.likes.indexOf(req.user._id);
      comment.likes.splice(index, 1);
    } else {
      // Like
      comment.likes.push(req.user._id);
      
      // Notify comment author if not self
      if (comment.user.toString() !== req.user._id.toString()) {
         // Check if notification already exists to avoid spam
         const existingNotif = await Notification.findOne({
           user: comment.user,
           type: 'like_comment', // Add to enum if needed
           fromUser: req.user._id,
           comment: comment._id
         });
         
         if (!existingNotif) {
            await Notification.create({
              user: comment.user,
              type: 'like_comment', // You might map this to 'like' or a new type
              fromUser: req.user._id,
              post: comment.post, // Link to the post
              comment: comment._id
            });
         }
      }
    }

    await comment.save();
    
    res.json({ success: true, likes: comment.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    await comment.deleteOne();

    // Decrement post's comment count
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -1 },
    });
    
    // Also delete all replies to this comment? 
    // For now, let's keep it simple or orphan them, but typically you'd delete replies too.
    await Comment.deleteMany({ parentComment: comment._id });

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
