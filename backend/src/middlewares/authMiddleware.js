/**
 * Authentication Middleware
 * Validates session tokens
 */

const { logger } = require('../utils/logger');

// In-memory session store (use Redis in production)
const sessions = new Map();

function authenticate(req, res, next) {
  const sessionToken = req.headers['x-session-token'];
  const orgId = req.headers['x-org-id'];

  if (!sessionToken || !orgId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing session token or org ID'
    });
  }

  const sessionKey = `${orgId}:${sessionToken}`;
  const session = sessions.get(sessionKey);

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired session'
    });
  }

  // Check session expiration
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionKey);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Session expired'
    });
  }

  // Attach session to request
  req.sfSession = session;
  next();
}

function createSession(orgId, sessionData) {
  const sessionToken = Math.random().toString(36).substring(2);
  const expiresAt = Date.now() + (2 * 60 * 60 * 1000); // 2 hours

  const session = {
    ...sessionData,
    orgId,
    sessionToken,
    createdAt: Date.now(),
    expiresAt
  };

  sessions.set(`${orgId}:${sessionToken}`, session);
  logger.info('Session created', { orgId, sessionToken });

  return { sessionToken, expiresAt };
}

function destroySession(orgId, sessionToken) {
  const sessionKey = `${orgId}:${sessionToken}`;
  sessions.delete(sessionKey);
  logger.info('Session destroyed', { orgId });
}

module.exports = { authenticate, createSession, destroySession };
