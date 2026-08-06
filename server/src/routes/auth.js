// server/src/routes/auth.js
import { Router } from 'express';
import { register, login, getMe, logout, updateProfile } from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, register);
authRoutes.post('/login', authLimiter, login);
authRoutes.get('/me', authenticate, getMe);
authRoutes.post('/logout', authenticate, logout);
authRoutes.put('/profile', authenticate, updateProfile);
