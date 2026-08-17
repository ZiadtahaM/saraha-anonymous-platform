import Post from '../db/models/postsmodel.js';

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const author = req.user._id; 

    const newPost = await Post.create({ content, author });

    res.status(201).json({
      success: true,
      data: newPost,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
    });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'Username email'); // Populate author details
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
    });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const postId = req.params._id;
    const UserId = req.User._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if the User is the author of the post
    if (post.author.toString() !== UserId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
    });
  }
};