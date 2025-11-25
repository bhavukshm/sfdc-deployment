/**
 * Salesforce Metadata API Client (SOAP)
 * 
 * Purpose: Handle Metadata API interactions for deployments and retrieves
 * Uses hand-crafted SOAP envelopes - NO jsforce
 * 
 * Documentation: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/
 * 
 * IMPORTANT: Metadata API operations are ASYNCHRONOUS
 * - deploy() returns an AsyncResult with an ID
 * - Must poll checkDeployStatus() to monitor progress
 * - Same for retrieve() operations
 */

const axios = require('axios');
const xml2js = require('xml2js');
const SF_CONFIG = require('../../config/salesforce');
const { buildSOAPEnvelope, parseSOAPResponse } = require('../../utils/soapHelper');
const { logger } = require('../../utils/logger');

class SalesforceMetadataClient {
  constructor(instanceUrl, accessToken, sessionId) {
    this.instanceUrl = instanceUrl;
    this.accessToken = accessToken;
    this.sessionId = sessionId || accessToken;
    this.endpointUrl = `${instanceUrl}${SF_CONFIG.endpoints.metadata}`;
  }

  /**
   * Deploy metadata ZIP to Salesforce
   * @param {Buffer} zipBuffer - ZIP file buffer
   * @param {Object} deployOptions - Deploy options
   * @returns {Promise<Object>} AsyncResult with deploy ID
   */
  async deploy(zipBuffer, deployOptions = {}) {
    try {
      const base64Zip = zipBuffer.toString('base64');
      const options = { ...SF_CONFIG.deployOptions, ...deployOptions };

      const soapBody = `
        <met:deploy>
          <met:ZipFile>${base64Zip}</met:ZipFile>
          <met:DeployOptions>
            <met:allowMissingFiles>${options.allowMissingFiles}</met:allowMissingFiles>
            <met:autoUpdatePackage>${options.autoUpdatePackage}</met:autoUpdatePackage>
            <met:checkOnly>${options.checkOnly}</met:checkOnly>
            <met:ignoreWarnings>${options.ignoreWarnings}</met:ignoreWarnings>
            <met:performRetrieve>${options.performRetrieve}</met:performRetrieve>
            <met:purgeOnDelete>${options.purgeOnDelete}</met:purgeOnDelete>
            <met:rollbackOnError>${options.rollbackOnError}</met:rollbackOnError>
            <met:singlePackage>${options.singlePackage}</met:singlePackage>
            <met:testLevel>${options.testLevel}</met:testLevel>
          </met:DeployOptions>
        </met:deploy>
      `;

      const soapEnvelope = buildSOAPEnvelope(soapBody, this.sessionId, 'metadata');
      const response = await this._sendSOAPRequest(soapEnvelope);
      const result = await parseSOAPResponse(response);

      logger.info('Metadata deploy initiated', { deployId: result.id });
      return result;
    } catch (error) {
      logger.error('Deploy failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Check deployment status
   * @param {string} deployId - Deployment ID
   * @param {boolean} includeDetails - Include component details
   * @returns {Promise<Object>} Deploy status
   */
  async checkDeployStatus(deployId, includeDetails = true) {
    try {
      const soapBody = `
        <met:checkDeployStatus>
          <met:asyncProcessId>${deployId}</met:asyncProcessId>
          <met:includeDetails>${includeDetails}</met:includeDetails>
        </met:checkDeployStatus>
      `;

      const soapEnvelope = buildSOAPEnvelope(soapBody, this.sessionId, 'metadata');
      const response = await this._sendSOAPRequest(soapEnvelope);
      const result = await parseSOAPResponse(response);

      logger.info('Deploy status checked', { deployId, status: result.status });
      return result;
    } catch (error) {
      logger.error('Check deploy status failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Retrieve metadata from Salesforce
   * @param {Object} retrieveRequest - Package manifest
   * @returns {Promise<Object>} AsyncResult with retrieve ID
   */
  async retrieve(retrieveRequest) {
    try {
      const packageXml = this._buildPackageXml(retrieveRequest.types);

      const soapBody = `
        <met:retrieve>
          <met:retrieveRequest>
            <met:apiVersion>${SF_CONFIG.apiVersion}</met:apiVersion>
            <met:singlePackage>true</met:singlePackage>
            <met:unpackaged>
              ${packageXml}
            </met:unpackaged>
          </met:retrieveRequest>
        </met:retrieve>
      `;

      const soapEnvelope = buildSOAPEnvelope(soapBody, this.sessionId, 'metadata');
      const response = await this._sendSOAPRequest(soapEnvelope);
      const result = await parseSOAPResponse(response);

      logger.info('Metadata retrieve initiated', { retrieveId: result.id });
      return result;
    } catch (error) {
      logger.error('Retrieve failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Check retrieve status and get ZIP
   * @param {string} retrieveId - Retrieve ID
   * @returns {Promise<Object>} Retrieve result with ZIP
   */
  async checkRetrieveStatus(retrieveId) {
    try {
      const soapBody = `
        <met:checkRetrieveStatus>
          <met:asyncProcessId>${retrieveId}</met:asyncProcessId>
        </met:checkRetrieveStatus>
      `;

      const soapEnvelope = buildSOAPEnvelope(soapBody, this.sessionId, 'metadata');
      const response = await this._sendSOAPRequest(soapEnvelope);
      const result = await parseSOAPResponse(response);

      if (result.done && result.zipFile) {
        result.zipBuffer = Buffer.from(result.zipFile, 'base64');
      }

      logger.info('Retrieve status checked', { retrieveId, status: result.status });
      return result;
    } catch (error) {
      logger.error('Check retrieve status failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * List metadata types
   * @param {string} metadataType - Type to list
   * @param {string} folder - Optional folder
   * @returns {Promise<Array>} Metadata members
   */
  async listMetadata(metadataType, folder = null) {
    try {
      const folderXml = folder ? `<met:folder>${folder}</met:folder>` : '';
      
      const soapBody = `
        <met:listMetadata>
          <met:queries>
            <met:type>${metadataType}</met:type>
            ${folderXml}
          </met:queries>
        </met:listMetadata>
      `;

      const soapEnvelope = buildSOAPEnvelope(soapBody, this.sessionId, 'metadata');
      const response = await this._sendSOAPRequest(soapEnvelope);
      const result = await parseSOAPResponse(response);

      logger.info('Listed metadata', { type: metadataType, count: result.length });
      return result;
    } catch (error) {
      logger.error('List metadata failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Describe metadata
   * @param {string} apiVersion - API version
   * @returns {Promise<Object>} Metadata describe result
   */
  async describeMetadata(apiVersion = SF_CONFIG.apiVersion) {
    try {
      const soapBody = `
        <met:describeMetadata>
          <met:asOfVersion>${apiVersion}</met:asOfVersion>
        </met:describeMetadata>
      `;

      const soapEnvelope = buildSOAPEnvelope(soapBody, this.sessionId, 'metadata');
      const response = await this._sendSOAPRequest(soapEnvelope);
      const result = await parseSOAPResponse(response);

      logger.info('Described metadata');
      return result;
    } catch (error) {
      logger.error('Describe metadata failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Build package.xml content
   */
  _buildPackageXml(types) {
    let xml = '';
    types.forEach(type => {
      xml += '<met:types>';
      type.members.forEach(member => {
        xml += `<met:members>${member}</met:members>`;
      });
      xml += `<met:name>${type.name}</met:name>`;
      xml += '</met:types>';
    });
    return xml;
  }

  /**
   * Send SOAP request
   */
  async _sendSOAPRequest(soapEnvelope) {
    const response = await axios.post(this.endpointUrl, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '""'
      }
    });
    return response.data;
  }

  /**
   * Error handler
   */
  _handleError(error) {
    if (error.response) {
      return new Error(`Metadata API Error: ${error.response.data}`);
    }
    return error;
  }
}

module.exports = SalesforceMetadataClient;
