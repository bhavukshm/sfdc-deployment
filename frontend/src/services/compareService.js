/**
 * Comparison Service
 */

import apiClient from './apiClient';

export const compareService = {
  async compareMetadata(sourceMetadata, targetMetadata, headers) {
    const response = await apiClient.post('/compare/metadata',
      { sourceMetadata, targetMetadata },
      { headers }
    );
    return response.data;
  },

  async compareSObjects(sourceObjects, targetObjects, headers) {
    const response = await apiClient.post('/compare/sobjects',
      { sourceObjects, targetObjects },
      { headers }
    );
    return response.data;
  }
};
