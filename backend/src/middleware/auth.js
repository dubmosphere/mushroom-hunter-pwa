import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

export const authenticate = async (req, res, next) => {
  try {
    // Try to get token from cookie first (preferred), then fall back to Authorization header (backward compatibility)
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
      throw new AuthenticationError('Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid authentication');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error); // Pass to error handler
  }
};

export const requireAdmin = (req, res, next) => {
  // Ensure user exists (should be set by authenticate middleware)
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  next();
};
