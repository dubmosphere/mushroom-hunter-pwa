import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { validationResult } from 'express-validator';
import { ValidationError, AuthenticationError, ConflictError, asyncHandler } from '../utils/errors.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';

  // Access token cookie (shorter expiry)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd, // Only send over HTTPS in production
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });

  // Refresh token cookie (longer expiry)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth'
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/auth' });
};

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { email, username, password } = req.body;

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }]
    }
  });

  if (existingUser) {
    throw new ConflictError('User with this email or username already exists');
  }

  const user = await User.create({
    email,
    username,
    password,
    role: 'user'
  });

  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    user: user.toJSON(),
    message: 'Registration successful'
  });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user || !user.isActive) {
    throw new AuthenticationError('Invalid credentials');
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    throw new AuthenticationError('Invalid credentials');
  }

  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    user: user.toJSON(),
    message: 'Login successful'
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Logged out successfully' });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AuthenticationError('No refresh token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    clearAuthCookies(res);
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  if (decoded.type !== 'refresh') {
    clearAuthCookies(res);
    throw new AuthenticationError('Invalid token type');
  }

  const user = await User.findByPk(decoded.userId);

  if (!user || !user.isActive) {
    clearAuthCookies(res);
    throw new AuthenticationError('Invalid refresh token');
  }

  const newAccessToken = generateToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  setAuthCookies(res, newAccessToken, newRefreshToken);

  res.json({
    user: user.toJSON(),
    message: 'Token refreshed successfully'
  });
});
