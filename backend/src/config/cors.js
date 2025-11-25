/**
 * CORS Configuration
 * 
 * Purpose: Configure Cross-Origin Resource Sharing
 * 
 * IMPORTANT: Salesforce APIs must NEVER be called directly from the frontend
 * because:
 * 1. Salesforce does not support CORS for most APIs
 * 2. Would expose credentials in browser
 * 3. Cannot properly handle OAuth refresh flow client-side
 * 
 * This backend acts as a secure proxy for all Salesforce operations.
 */

const config = require('./env');

const corsConfig = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in whitelist
    if (config.cors.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Org-Id',
    'X-Session-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Size'],
  maxAge: 86400 // 24 hours
};

module.exports = { corsConfig };
