import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required()
});
const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });

const sign = (user) => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    res.status(201).json({ id: user.id, username: user.username, link: `/api/users/${user.username}` });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Username or email already taken' });
    next(err);
  }
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    const ok = user && (await bcrypt.compare(req.body.password, user.passwordHash));
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: sign(user), username: user.username });
  } catch (err) {
    next(err);
  }
});

export default router;
