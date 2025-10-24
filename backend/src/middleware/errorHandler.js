import { AppError } from '../utils/errors.js';

/**
 * Centralized error handling middleware
 * Converts all errors to consistent JSON responses
 */
export const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation error';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'Resource already exists';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    code = 'INVALID_REFERENCE';
    message = 'Invalid reference to related resource';
  } else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    code = 'DATABASE_ERROR';
    message = 'Database operation failed';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // Handle express-validator errors
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.array();
  }

  // Log error for debugging (only log unexpected errors in production)
  if (!err.isOperational || process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      code,
      message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  }

  // Don't leak error details in production for non-operational errors
  if (!err.isOperational && process.env.NODE_ENV === 'production') {
    message = 'An unexpected error occurred';
    details = null;
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`
    }
  });
};
