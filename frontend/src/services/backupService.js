/**
 * Backup Service
 */

import apiClient from './apiClient';

export const backupService = {
  async createBackup(metadataTypes, headers) {
    const response = await apiClient.post('/backup/create',
      { metadataTypes },
      { headers }
    );
    return response.data;
  },

  async listBackups(orgId, headers) {
    const response = await apiClient.get('/backup/list', {
      params: { orgId },
      headers
    });
    return response.data;
  },

  async getBackup(backupId, headers) {
    const response = await apiClient.get(`/backup/${backupId}`, { headers });
    return response.data;
  },

  async deleteBackup(backupId, headers) {
    const response = await apiClient.delete(`/backup/${backupId}`, { headers });
    return response.data;
  },

  async cleanupOldBackups(headers) {
    const response = await apiClient.post('/backup/cleanup', {}, { headers });
    return response.data;
  }
};
