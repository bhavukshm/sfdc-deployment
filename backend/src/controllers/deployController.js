/**
 * Deploy Controller
 */

const DeployService = require('../services/deploy/deployService');
const SalesforceMetadataClient = require('../services/salesforce/metadataClient');

class DeployController {
  static async deploy(req, res, next) {
    try {
      const { deploymentPackage, options } = req.body;
      const sessionInfo = req.sfSession;
      
      const result = await DeployService.deploy(sessionInfo, deploymentPackage, options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async checkDeployStatus(req, res, next) {
    try {
      const { deployId } = req.params;
      const { includeDetails = true } = req.query;
      const { instanceUrl, accessToken } = req.sfSession;
      
      const client = new SalesforceMetadataClient(instanceUrl, accessToken);
      const result = await client.checkDeployStatus(deployId, includeDetails === 'true');
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async validateDeployment(req, res, next) {
    try {
      const { deploymentPackage } = req.body;
      const sessionInfo = req.sfSession;
      
      const result = await DeployService.validateDeployment(sessionInfo, deploymentPackage);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async quickDeploy(req, res, next) {
    try {
      const { validationId } = req.params;
      const sessionInfo = req.sfSession;
      
      const result = await DeployService.quickDeploy(sessionInfo, validationId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DeployController;
