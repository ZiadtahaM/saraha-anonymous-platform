import mongoose from 'mongoose';

const reactSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reaction: {
    type: String,
    enum: ['like', 'dislike', 'love', 'haha', 'wow', 'sad', 'angry'], 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const React = mongoose.model('React', reactSchema);
export default React;