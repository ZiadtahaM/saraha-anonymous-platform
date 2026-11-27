import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, maxlength: 500 },
    // HMAC of the sender IP. Used only for block and abuse limits, never returned.
    senderFingerprint: { type: String, required: true, select: false },
    read: { type: Boolean, default: false },
    answer: { type: String, maxlength: 500 },
    answeredAt: Date,
    reported: { type: Boolean, default: false }
  },
  { timestamps: true }
);

messageSchema.index({ recipient: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
