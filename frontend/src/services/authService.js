/**
 * Authentication Service
 * Handles OAuth flow with backend
 */

import apiClient from './apiClient';

export const authService = {
  async getAuthorizationUrl() {
    const response = await apiClient.get('/auth/authorize');
    return response.data;
  },

  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(sessionToken, orgId, accessToken) {
    const response = await apiClient.post('/auth/logout', {
      sessionToken,
      orgId,
      accessToken
    });
    return response.data;
  },

  async getUserInfo(accessToken, instanceUrl) {
    const response = await apiClient.get('/auth/userinfo', {
      params: { accessToken, instanceUrl }
    });
    return response.data;
  }
};
