/**
 * Salesforce OAuth 2.0 Service
 * 
 * Implements Authorization Code Flow with Refresh Token
 * No wrapper libraries - native axios calls only
 * 
 * Flow:
 * 1. getAuthorizationUrl() - Generate URL for user login
 * 2. exchangeCodeForToken() - Exchange auth code for access token
 * 3. refreshAccessToken() - Refresh expired token
 * 4. revokeToken() - Logout/revoke access
 */

const axios = require('axios');
const config = require('../../config/env');
const SF_CONFIG = require('../../config/salesforce');
const { logger } = require('../../utils/logger');
const crypto = require("crypto");

function generatePKCE() {
  const code_verifier = crypto.randomBytes(32).toString("base64url");
  const code_challenge = crypto
    .createHash("sha256")
    .update(code_verifier)
    .digest("base64url");

  return { code_verifier, code_challenge };
}

class OAuthService {
  /**
   * Generate authorization URL for user to login
   * @param {string} state - CSRF protection state parameter
   * @returns {string} Authorization URL
   */
  static getAuthorizationUrl(state = null) {
    const { code_verifier, code_challenge } = generatePKCE();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.salesforce.clientId,
      redirect_uri: config.salesforce.callbackUrl,
      scope: config.salesforce.scopes.join(' '),
      code_challenge_method: 'S256',
      code_challenge: code_challenge
    });

    config.salesforce.code_verifier = code_verifier
    if (state) {
      params.append('state', state);
    }

    const url = `${SF_CONFIG.oauth.authorizeUrl}?${params.toString()}`;
    logger.info('Generated authorization URL');
    return url;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from callback
   * @returns {Promise<Object>} Token response
   */
  static async exchangeCodeForToken(code) {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: config.salesforce.clientId,
        client_secret: config.salesforce.clientSecret,
        redirect_uri: config.salesforce.callbackUrl,
        code_verifier: config.salesforce.code_verifier
      });

      const response = await axios.post(SF_CONFIG.oauth.tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      logger.info('Successfully exchanged code for token');
      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        instance_url: response.data.instance_url,
        id: response.data.id,
        token_type: response.data.token_type,
        issued_at: response.data.issued_at,
        signature: response.data.signature
      };
    } catch (error) {
      logger.error('Token exchange failed', { error: error.message });
      throw new Error(`OAuth token exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token response
   */
  static async refreshAccessToken(refreshToken) {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.salesforce.clientId,
        client_secret: config.salesforce.clientSecret
      });

      const response = await axios.post(SF_CONFIG.oauth.tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      logger.info('Successfully refreshed access token');
      return {
        access_token: response.data.access_token,
        instance_url: response.data.instance_url,
        id: response.data.id,
        token_type: response.data.token_type,
        issued_at: response.data.issued_at,
        signature: response.data.signature
      };
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw new Error(`Token refresh failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Revoke access or refresh token
   * @param {string} token - Token to revoke
   * @returns {Promise<void>}
   */
  static async revokeToken(token) {
    try {
      const params = new URLSearchParams({ token });
      
      await axios.post(SF_CONFIG.oauth.revokeUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      logger.info('Token revoked successfully');
    } catch (error) {
      logger.error('Token revocation failed', { error: error.message });
      throw new Error(`Token revocation failed: ${error.message}`);
    }
  }

  /**
   * Get user info from Salesforce
   * @param {string} accessToken - Access token
   * @param {string} instanceUrl - Instance URL
   * @returns {Promise<Object>} User info
   */
  static async getUserInfo(accessToken, instanceUrl) {
    try {
      const response = await axios.get(`${instanceUrl}/services/oauth2/userinfo`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      logger.info('Retrieved user info');
      return response.data;
    } catch (error) {
      logger.error('Get user info failed', { error: error.message });
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }
}

module.exports = OAuthService;
