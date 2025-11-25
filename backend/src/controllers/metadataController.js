/**
 * Metadata Controller
 */

const SalesforceMetadataClient = require('../services/salesforce/metadataClient');
const SalesforceToolingClient = require('../services/salesforce/toolingClient');

class MetadataController {
  static async describeMetadata(req, res, next) {
    try {
      const { instanceUrl, accessToken } = req.sfSession;
      const client = new SalesforceMetadataClient(instanceUrl, accessToken);
      
      const result = await client.describeMetadata();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async listMetadata(req, res, next) {
    try {
      const { type } = req.params;
      const { folder } = req.query;
      const { instanceUrl, accessToken } = req.sfSession;
      
      const client = new SalesforceMetadataClient(instanceUrl, accessToken);
      const result = await client.listMetadata(type, folder);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async retrieve(req, res, next) {
    try {
      const { retrieveRequest } = req.body;
      const { instanceUrl, accessToken } = req.sfSession;
      
      const client = new SalesforceMetadataClient(instanceUrl, accessToken);
      const result = await client.retrieve(retrieveRequest);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async checkRetrieveStatus(req, res, next) {
    try {
      const { retrieveId } = req.params;
      const { instanceUrl, accessToken } = req.sfSession;
      
      const client = new SalesforceMetadataClient(instanceUrl, accessToken);
      const result = await client.checkRetrieveStatus(retrieveId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async queryMetadata(req, res, next) {
    try {
      const { soql } = req.body;
      const { instanceUrl, accessToken } = req.sfSession;
      
      const client = new SalesforceToolingClient(instanceUrl, accessToken);
      const result = await client.query(soql);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MetadataController;
