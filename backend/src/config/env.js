/**
 * Environment Configuration
 * Centralizes all environment variable access with validation
 */

const required = (key) => {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Salesforce OAuth
  salesforce: {
    loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    clientId: required('SF_CLIENT_ID'),
    clientSecret: required('SF_CLIENT_SECRET'),
    callbackUrl: process.env.SF_CALLBACK_URL || 'http://localhost:5000/api/auth/callback',
    scopes: (process.env.SF_OAUTH_SCOPES || 'api refresh_token web full').split(' '),
    apiVersion: process.env.SF_API_VERSION || '59.0'
  },

  // Session
  session: {
    secret: required('SESSION_SECRET'),
    timeout: parseInt(process.env.SESSION_TIMEOUT || '7200000', 10) // 2 hours default
  },

  // CORS
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },

  // Backup
  backup: {
    directory: process.env.BACKUP_DIRECTORY || './backups',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
    enableScheduled: process.env.ENABLE_SCHEDULED_BACKUPS === 'true',
    cronSchedule: process.env.BACKUP_CRON_SCHEDULE || '0 2 * * *' // 2 AM daily
  }
};

module.exports = config;
