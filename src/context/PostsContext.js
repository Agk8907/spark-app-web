import React, { createContext, useState, useContext, useEffect } from 'react';
import { postAPI } from '../services/api';
import socketService from '../services/socket';

const PostsContext = createContext();

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within PostsProvider');
  }
  return context;
};

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Listen for real-time post updates
    socketService.onNewPost((newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    });

    socketService.onPostLike((data) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === data.postId
            ? { ...post, likes: data.likes, isLiked: data.isLiked }
            : post
        )
      );
    });

    return () => {
      socketService.removeListener('post:new');
      socketService.removeListener('post:like');
    };
  }, []);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await postAPI.getFeed(page);

      if (response.success) {
        if (page === 1) {
          setPosts(response.posts);
        } else {
          setPosts((prev) => [...prev, ...response.posts]);
        }
        setCurrentPage(page);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await postAPI.createPost(postData);

      if (response.success) {
        setPosts((prev) => [response.post, ...prev]);
        socketService.emitPostCreated(response.post);
        return { success: true, post: response.post };
      }
    } catch (err) {
      setError(err.message || 'Failed to create post');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await postAPI.likePost(postId);

      if (response.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, likes: response.likes, isLiked: response.isLiked }
              : post
          )
        );
        socketService.emitPostLiked({ postId, likes: response.likes, isLiked: response.isLiked });
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await postAPI.deletePost(postId);

      if (response.success) {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Update user avatar in all posts when profile is updated
  const updateUserInPosts = (userId, userData) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.userId === userId || post.user?.id === userId) {
          return {
            ...post,
            user: {
              ...post.user,
              ...userData,
            },
          };
        }
        return post;
      })
    );
  };

  const value = {
    posts,
    loading,
    error,
    currentPage,
    fetchPosts,
    createPost,
    likePost,
    deletePost,
    updateUserInPosts,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

export default PostsContext;
