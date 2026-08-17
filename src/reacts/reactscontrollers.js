import React from '../db/models/reactsmodel.js';


export const addReaction = async (req, res) => {
  try {
    const { postId, reaction } = req.body;
    const userId = req.user._id;


    const existingReaction = await React.findOne({ post: postId, user: userId });
    if (existingReaction) {
      return res.status(400).json({
        success: false,
        message: 'You have already reacted to this post',
      });
    }

    const newReaction = await React.create({ post: postId, user: userId, reaction });
    res.status(201).json({
      success: true,
      data: newReaction,
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
    });
  }
};

// Remove a reaction from a post
export const removeReaction = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const reaction = await React.findOneAndDelete({ post: postId, user: userId });
    if (!reaction) {
      return res.status(404).json({
        success: false,
        message: 'Reaction not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
    });
  }
};