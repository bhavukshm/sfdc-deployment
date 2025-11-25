/**
 * Salesforce Tooling API Client
 * 
 * Purpose: Handle Tooling API interactions for metadata development
 * Uses native axios HTTP calls
 * 
 * Documentation: https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/
 */

const axios = require('axios');
const SF_CONFIG = require('../../config/salesforce');
const { logger } = require('../../utils/logger');

class SalesforceToolingClient {
  constructor(instanceUrl, accessToken) {
    this.instanceUrl = instanceUrl;
    this.accessToken = accessToken;
    this.baseUrl = `${instanceUrl}${SF_CONFIG.endpoints.tooling}`;
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
   * Execute SOQL query via Tooling API
   * @param {string} soql - SOQL query
   * @returns {Promise<Object>} Query results
   */
  async query(soql) {
    try {
      const client = this._getAxiosInstance();
      const response = await client.get(`${this.baseUrl}/query`, {
        params: { q: soql }
      });
      
      logger.info('Tooling API query executed');
      return response.data;
    } catch (error) {
      logger.error('Tooling query failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Get all Apex classes
   * @returns {Promise<Array>} Apex classes
   */
  async getApexClasses() {
    const soql = 'SELECT Id, Name, Body, LengthWithoutComments, CreatedDate, LastModifiedDate FROM ApexClass';
    return this.query(soql);
  }

  /**
   * Get all Apex triggers
   * @returns {Promise<Array>} Apex triggers
   */
  async getApexTriggers() {
    const soql = 'SELECT Id, Name, Body, TableEnumOrId, CreatedDate, LastModifiedDate FROM ApexTrigger';
    return this.query(soql);
  }

  /**
   * Get Apex class by name
   * @param {string} className - Class name
   * @returns {Promise<Object>} Apex class
   */
  async getApexClassByName(className) {
    const soql = `SELECT Id, Name, Body FROM ApexClass WHERE Name = '${className}'`;
    const result = await this.query(soql);
    return result.records[0] || null;
  }

  /**
   * Create or update Apex class
   * @param {Object} classData - { Name, Body }
   * @returns {Promise<Object>} Result
   */
  async saveApexClass(classData) {
    try {
      const client = this._getAxiosInstance();
      const response = await client.post(`${this.baseUrl}/sobjects/ApexClass`, classData);
      
      logger.info(`Saved Apex class: ${classData.Name}`);
      return response.data;
    } catch (error) {
      logger.error('Save Apex class failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Get Lightning components
   * @returns {Promise<Array>} Aura bundles
   */
  async getAuraDefinitionBundles() {
    const soql = 'SELECT Id, DeveloperName, ApiVersion, Description FROM AuraDefinitionBundle';
    return this.query(soql);
  }

  /**
   * Get custom objects
   * @returns {Promise<Array>} Custom objects
   */
  async getCustomObjects() {
    const soql = 'SELECT Id, DeveloperName, NamespacePrefix, Label FROM CustomObject WHERE NamespacePrefix = null';
    return this.query(soql);
  }

  /**
   * Get custom fields for an object
   * @param {string} objectName - Object API name
   * @returns {Promise<Array>} Custom fields
   */
  async getCustomFields(objectName) {
    const soql = `SELECT Id, DeveloperName, DataType, Length FROM CustomField WHERE TableEnumOrId = '${objectName}'`;
    return this.query(soql);
  }

  /**
   * Execute anonymous Apex
   * @param {string} apexCode - Apex code to execute
   * @returns {Promise<Object>} Execution result
   */
  async executeAnonymous(apexCode) {
    try {
      const client = this._getAxiosInstance();
      const response = await client.get(`${this.baseUrl}/executeAnonymous`, {
        params: { anonymousBody: apexCode }
      });
      
      logger.info('Anonymous Apex executed');
      return response.data;
    } catch (error) {
      logger.error('Execute anonymous failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Get symbol table (for Apex code completion)
   * @param {string} classId - ApexClass ID
   * @returns {Promise<Object>} Symbol table
   */
  async getSymbolTable(classId) {
    try {
      const client = this._getAxiosInstance();
      const response = await client.get(`${this.baseUrl}/sobjects/ApexClass/${classId}/SymbolTable`);
      
      logger.info(`Retrieved symbol table for class: ${classId}`);
      return response.data;
    } catch (error) {
      logger.error('Get symbol table failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Run tests synchronously
   * @param {Array<string>} classIds - Test class IDs
   * @returns {Promise<Object>} Test results
   */
  async runTestsSynchronous(classIds) {
    try {
      const client = this._getAxiosInstance();
      const response = await client.post(`${this.baseUrl}/runTestsSynchronous`, {
        classIds: classIds
      });
      
      logger.info(`Ran ${classIds.length} test classes`);
      return response.data;
    } catch (error) {
      logger.error('Run tests failed', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Error handler
   */
  _handleError(error) {
    if (error.response) {
      return new Error(`Tooling API Error: ${JSON.stringify(error.response.data)}`);
    }
    return error;
  }
}

module.exports = SalesforceToolingClient;
