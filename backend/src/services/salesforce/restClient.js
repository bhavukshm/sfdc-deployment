/**
 * Salesforce REST API Client
 * 
 * Purpose: Handle all REST API interactions with Salesforce
 * Uses native axios HTTP calls - NO jsforce or wrapper libraries
 * 
 * Documentation: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/
 */

const axios = require('axios');
const SF_CONFIG = require('../../config/salesforce');
const { logger } = require('../../utils/logger');

class SalesforceRestClient {
  constructor(instanceUrl, accessToken) {
    this.instanceUrl = instanceUrl;
    this.accessToken = accessToken;
    this.baseUrl = `${instanceUrl}${SF_CONFIG.endpoints.rest}`;
  }

  /**
   * Create axios instance with auth headers
   */
  _getAxiosInstance() {
    return axios.create({
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Execute SOQL query
   * @param {string} soql - SOQL query string
   * @returns {Promise<Object>} Query results
   */
  async query(soql) {
    try {
      const client = this._getAxiosInstance();
      const response = await client.get(`${this.baseUrl}/query`, {
        params: { q: soql }
      });
      
      logger.info('SOQL query executed successfully');
      return response.data;
    } catch (error) {
      logger.error('SOQL query failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Execute SOQL query with all records (handles pagination)
   * @param {string} soql - SOQL query string
   * @returns {Promise<Array>} All records
   */
  async queryAll(soql) {
    try {
      let allRecords = [];
      let nextRecordsUrl = null;
      const client = this._getAxiosInstance();

      // Initial query
      const response = await client.get(`${this.baseUrl}/query`, {
        params: { q: soql }
      });
      
      allRecords = response.data.records;
      nextRecordsUrl = response.data.nextRecordsUrl;

      // Fetch remaining pages
      while (nextRecordsUrl) {
        const pageResponse = await client.get(`${this.instanceUrl}${nextRecordsUrl}`);
        allRecords = allRecords.concat(pageResponse.data.records);
        nextRecordsUrl = pageResponse.data.nextRecordsUrl;
      }

      logger.info(`Retrieved ${allRecords.length} records via queryAll`);
      return allRecords;
    } catch (error) {
      logger.error('QueryAll failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Describe an SObject
   * @param {string} sobjectType - SObject API name
   * @returns {Promise<Object>} SObject metadata
   */
  async describeSObject(sobjectType) {
    try {
      const client = this._getAxiosInstance();
      const response = await client.get(`${this.baseUrl}/sobjects/${sobjectType}/describe`);
      
      logger.info(`Described SObject: ${sobjectType}`);
      return response.data;
    } catch (error) {
      logger.error(`Describe SObject failed: ${sobjectType}`, { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Get all SObjects in org
   * @returns {Promise<Object>} Global describe result
   */
  async describeGlobal() {
    try {
      const client = this._getAxiosInstance();
      const response = await client.get(`${this.baseUrl}/sobjects`);
      
      logger.info('Global describe completed');
      return response.data;
    } catch (error) {
      logger.error('Global describe failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Create a record
   * @param {string} sobjectType - SObject API name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record info
   */
  async createRecord(sobjectType, data) {
    try {
      const client = this._getAxiosInstance();
      const response = await client.post(`${this.baseUrl}/sobjects/${sobjectType}`, data);
      
      logger.info(`Created ${sobjectType} record: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error(`Create ${sobjectType} failed`, { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Update a record
   * @param {string} sobjectType - SObject API name
   * @param {string} recordId - Record ID
   * @param {Object} data - Update data
   * @returns {Promise<void>}
   */
  async updateRecord(sobjectType, recordId, data) {
    try {
      const client = this._getAxiosInstance();
      await client.patch(`${this.baseUrl}/sobjects/${sobjectType}/${recordId}`, data);
      
      logger.info(`Updated ${sobjectType} record: ${recordId}`);
    } catch (error) {
      logger.error(`Update ${sobjectType} failed`, { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Delete a record
   * @param {string} sobjectType - SObject API name
   * @param {string} recordId - Record ID
   * @returns {Promise<void>}
   */
  async deleteRecord(sobjectType, recordId) {
    try {
      const client = this._getAxiosInstance();
      await client.delete(`${this.baseUrl}/sobjects/${sobjectType}/${recordId}`);
      
      logger.info(`Deleted ${sobjectType} record: ${recordId}`);
    } catch (error) {
      logger.error(`Delete ${sobjectType} failed`, { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Get org limits
   * @returns {Promise<Object>} Org limits
   */
  async getLimits() {
    try {
      const client = this._getAxiosInstance();
      const response = await client.get(`${this.baseUrl}/limits`);
      
      logger.info('Retrieved org limits');
      return response.data;
    } catch (error) {
      logger.error('Get limits failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Error handler
   */
  _handleError(error) {
    if (error.response) {
      return new Error(`Salesforce REST API Error: ${JSON.stringify(error.response.data)}`);
    }
    return error;
  }
}

module.exports = SalesforceRestClient;
