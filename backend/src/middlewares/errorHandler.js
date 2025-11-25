/**
 * Global Error Handler Middleware
 */

const { logger } = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path
  });

  // Salesforce API errors
  if (err.message.includes('Salesforce')) {
    return res.status(502).json({
      error: 'Salesforce API Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // OAuth errors
  if (err.message.includes('OAuth')) {
    return res.status(401).json({
      error: 'Authentication Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
    timestamp: new Date().toISOString()
  });
}

module.exports = { errorHandler };
