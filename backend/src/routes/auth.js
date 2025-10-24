import express from 'express';
import { body } from 'express-validator';
import { register, login, getCurrentUser, logout, refreshToken } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('username').trim().isLength({ min: 3, max: 30 }),
    body('password').isLength({ min: 6 })
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  login
);

router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getCurrentUser);

export default router;
