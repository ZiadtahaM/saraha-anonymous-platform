import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    // Owner switch: false means the public link stops accepting new messages.
    acceptingMessages: { type: Boolean, default: true },
    // Sender fingerprints (HMAC of IP) this owner blocked. Never exposed through the API.
    blockedFingerprints: { type: [String], default: [], select: false }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
