/**
 * Metadata Service
 * Handles metadata operations through backend
 */

import apiClient from './apiClient';

export const metadataService = {
  async describeMetadata(headers) {
    const response = await apiClient.get('/metadata/describe', { headers });
    return response.data;
  },

  async listMetadata(type, folder, headers) {
    const response = await apiClient.get(`/metadata/list/${type}`, {
      params: { folder },
      headers
    });
    return response.data;
  },

  async retrieve(retrieveRequest, headers) {
    const response = await apiClient.post('/metadata/retrieve', 
      { retrieveRequest }, 
      { headers }
    );
    return response.data;
  },

  async checkRetrieveStatus(retrieveId, headers) {
    const response = await apiClient.get(`/metadata/retrieve/status/${retrieveId}`, { headers });
    return response.data;
  },

  async queryMetadata(soql, headers) {
    const response = await apiClient.post('/metadata/query', { soql }, { headers });
    return response.data;
  }
};
