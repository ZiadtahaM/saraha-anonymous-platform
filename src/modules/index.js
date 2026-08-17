import express from 'express';
import userRoutes from './user/user.routes.js';

export const router = express.Router();

router.use('/users', userRoutes);