/**
 * Deployment Service
 */

import apiClient from './apiClient';

export const deployService = {
  async deploy(deploymentPackage, options, headers) {
    const response = await apiClient.post('/deploy/deploy', 
      { deploymentPackage, options },
      { headers }
    );
    return response.data;
  },

  async checkDeployStatus(deployId, includeDetails, headers) {
    const response = await apiClient.get(`/deploy/deploy/status/${deployId}`, {
      params: { includeDetails },
      headers
    });
    return response.data;
  },

  async validateDeployment(deploymentPackage, headers) {
    const response = await apiClient.post('/deploy/validate',
      { deploymentPackage },
      { headers }
    );
    return response.data;
  },

  async quickDeploy(validationId, headers) {
    const response = await apiClient.post(`/deploy/quickDeploy/${validationId}`, {}, { headers });
    return response.data;
  }
};
