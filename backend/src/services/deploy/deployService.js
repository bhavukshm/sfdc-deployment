/**
 * Deployment Service
 * 
 * Orchestrates metadata deployments
 * Monitors async deploy status
 * Handles rollbacks on failure
 */

const SalesforceMetadataClient = require('../salesforce/metadataClient');
const { createDeploymentPackage } = require('../../utils/zipHelper');
const { logger } = require('../../utils/logger');

class DeployService {
  /**
   * Deploy metadata to Salesforce
   * @param {Object} sessionInfo - Salesforce session
   * @param {Object} deploymentPackage - Metadata package
   * @param {Object} options - Deploy options
   * @returns {Promise<Object>} Deploy result
   */
  static async deploy(sessionInfo, deploymentPackage, options = {}) {
    try {
      const { instanceUrl, accessToken } = sessionInfo;
      const client = new SalesforceMetadataClient(instanceUrl, accessToken);

      // Create ZIP package
      const zipBuffer = await createDeploymentPackage(deploymentPackage);
      
      logger.info('Starting deployment', {
        componentCount: deploymentPackage.components?.length || 0,
        checkOnly: options.checkOnly || false
      });

      // Initiate deployment
      const asyncResult = await client.deploy(zipBuffer, options);

      // Poll for completion
      const finalResult = await this._pollDeployStatus(client, asyncResult.id, options.timeout || 300000);

      logger.info('Deployment completed', {
        deployId: asyncResult.id,
        status: finalResult.status,
        success: finalResult.success
      });

      return {
        deployId: asyncResult.id,
        status: finalResult.status,
        success: finalResult.success,
        details: finalResult.details,
        componentSuccesses: finalResult.componentSuccesses,
        componentFailures: finalResult.componentFailures
      };
    } catch (error) {
      logger.error('Deployment failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Poll deployment status until complete
   */
  static async _pollDeployStatus(client, deployId, timeout) {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Deployment timeout exceeded');
      }

      const status = await client.checkDeployStatus(deployId, true);

      if (status.done) {
        return status;
      }

      logger.info('Deployment in progress', {
        deployId,
        status: status.status,
        progress: `${status.numberComponentsDeployed}/${status.numberComponentsTotal}`
      });

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Validate deployment (checkOnly = true)
   */
  static async validateDeployment(sessionInfo, deploymentPackage) {
    return this.deploy(sessionInfo, deploymentPackage, { checkOnly: true });
  }

  /**
   * Quick deploy (after successful validation)
   */
  static async quickDeploy(sessionInfo, validationId) {
    const { instanceUrl, accessToken } = sessionInfo;
    const client = new SalesforceMetadataClient(instanceUrl, accessToken);

    // Quick deploy uses validated deployment ID
    const result = await client.deploy(null, {
      validationId,
      checkOnly: false
    });

    logger.info('Quick deploy initiated', { validationId });
    return result;
  }
}

module.exports = DeployService;
