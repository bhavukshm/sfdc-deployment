/**
 * Authentication Controller
 */

const OAuthService = require('../services/salesforce/oauthService');
const { createSession, destroySession } = require('../middlewares/authMiddleware');
const config = require('../config/env');
const { logger } = require('../utils/logger');

class AuthController {
  /**
   * Generate authorization URL
   */
  static async authorize(req, res, next) {
    try {
      const state = Math.random().toString(36).substring(2);
      const authUrl = OAuthService.getAuthorizationUrl(state);

      res.json({
        authorizationUrl: authUrl,
        state
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * OAuth callback handler
   */
  static async callback(req, res, next) {
    try {
      const { code, state } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
      }

      // Exchange code for token
      const tokenResponse = await OAuthService.exchangeCodeForToken(code);

      // Get user info
      const userInfo = await OAuthService.getUserInfo(
        tokenResponse.access_token,
        tokenResponse.instance_url
      );

      // Create session
      const sessionData = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        instanceUrl: tokenResponse.instance_url,
        orgId: userInfo.organization_id,
        userId: userInfo.user_id,
        username: userInfo.preferred_username
      };

      const session = createSession(userInfo.organization_id, sessionData);

      // Redirect to frontend with session info
      const redirectUrl = `${config.frontendUrl}/auth/callback?sessionToken=${session.sessionToken}&orgId=${userInfo.organization_id}`;
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const tokenResponse = await OAuthService.refreshAccessToken(refreshToken);

      res.json({
        accessToken: tokenResponse.access_token,
        instanceUrl: tokenResponse.instance_url,
        issuedAt: tokenResponse.issued_at
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout and revoke token
   */
  static async logout(req, res, next) {
    try {
      const { sessionToken, orgId, accessToken } = req.body;

      if (accessToken) {
        await OAuthService.revokeToken(accessToken);
      }

      if (sessionToken && orgId) {
        destroySession(orgId, sessionToken);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user info
   */
  static async getUserInfo(req, res, next) {
    try {
      const { accessToken, instanceUrl } = req.query;

      if (!accessToken || !instanceUrl) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const userInfo = await OAuthService.getUserInfo(accessToken, instanceUrl);
      res.json(userInfo);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
