import { Router } from 'express';
import Joi from 'joi';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { fingerprint } from '../utils/fingerprint.js';

const router = Router();

const sendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages from this address, try again later' }
});

const messageSchema = Joi.object({ content: Joi.string().trim().min(1).max(500).required() });
const settingsSchema = Joi.object({ acceptingMessages: Joi.boolean().required() });

router.get('/me', authenticate, (req, res) => {
  const { id, username, email, acceptingMessages } = req.user;
  res.json({ id, username, email, acceptingMessages });
});

router.patch('/me/settings', authenticate, validate(settingsSchema), async (req, res) => {
  req.user.acceptingMessages = req.body.acceptingMessages;
  await req.user.save();
  res.json({ acceptingMessages: req.user.acceptingMessages });
});

router.delete('/me', authenticate, async (req, res) => {
  await Message.deleteMany({ recipient: req.user._id });
  await req.user.deleteOne();
  res.status(204).end();
});

// Public profile: username, whether the inbox is open, and answered messages only.
router.get('/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const answers = await Message.find({ recipient: user._id, answer: { $exists: true } })
    .sort({ answeredAt: -1 })
    .limit(50)
    .select('content answer answeredAt');
  res.json({ username: user.username, acceptingMessages: user.acceptingMessages, answers });
});

// Anonymous send. The sender is never asked for or shown an identity.
router.post('/:username/messages', sendLimiter, validate(messageSchema), async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('+blockedFingerprints');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.acceptingMessages) return res.status(403).json({ error: 'This inbox is closed' });
    const fp = fingerprint(req.ip);
    if (user.blockedFingerprints.includes(fp)) return res.status(403).json({ error: 'You cannot message this user' });
    await Message.create({ recipient: user._id, content: req.body.content, senderFingerprint: fp });
    res.status(201).json({ sent: true });
  } catch (err) {
    next(err);
  }
});

export default router;
