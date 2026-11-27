import { Router } from 'express';
import mongoose from 'mongoose';
import Joi from 'joi';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

const answerSchema = Joi.object({ answer: Joi.string().trim().min(1).max(500).required() });

async function ownMessage(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid message id' });
  const message = await Message.findOne({ _id: req.params.id, recipient: req.user._id }).select('+senderFingerprint');
  if (!message) return res.status(404).json({ error: 'Message not found' });
  req.message = message;
  next();
}

// Inbox, newest first. Sender data is never part of the response.
router.get('/', async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.read = false;
  const [items, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Message.countDocuments(filter)
  ]);
  res.json({ page, limit, total, items });
});

router.patch('/:id/read', ownMessage, async (req, res) => {
  req.message.read = true;
  await req.message.save();
  res.json({ read: true });
});

// Answering publishes the message and the answer on the public profile.
router.post('/:id/answer', ownMessage, validate(answerSchema), async (req, res) => {
  req.message.answer = req.body.answer;
  req.message.answeredAt = new Date();
  req.message.read = true;
  await req.message.save();
  res.json({ answered: true });
});

router.post('/:id/report', ownMessage, async (req, res) => {
  req.message.reported = true;
  await req.message.save();
  res.json({ reported: true });
});

// Blocks the sender (by HMAC fingerprint) from this owner's inbox. The owner never learns who it was.
router.post('/:id/block', ownMessage, async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $addToSet: { blockedFingerprints: req.message.senderFingerprint } });
  res.json({ blocked: true });
});

router.delete('/:id', ownMessage, async (req, res) => {
  await req.message.deleteOne();
  res.status(204).end();
});

export default router;
