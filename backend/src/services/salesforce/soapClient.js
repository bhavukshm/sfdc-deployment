/**
 * Salesforce Partner SOAP API Client
 * Hand-crafted SOAP envelopes for legacy operations
 */

const axios = require('axios');
const SF_CONFIG = require('../../config/salesforce');
const { buildSOAPEnvelope, parseSOAPResponse } = require('../../utils/soapHelper');
const { logger } = require('../../utils/logger');

class SalesforceSOAPClient {
  constructor(instanceUrl, sessionId) {
    this.instanceUrl = instanceUrl;
    this.sessionId = sessionId;
    this.endpointUrl = `${instanceUrl}${SF_CONFIG.endpoints.partner}`;
  }

  static async login(username, password) {
    const loginUrl = `${SF_CONFIG.loginUrl}${SF_CONFIG.endpoints.partner}`;
    const soapBody = `<urn:login><urn:username>${username}</urn:username><urn:password>${password}</urn:password></urn:login>`;
    const soapEnvelope = buildSOAPEnvelope(soapBody, null, 'partner');
    
    const response = await axios.post(loginUrl, soapEnvelope, {
      headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': 'login' }
    });
    
    return parseSOAPResponse(response.data);
  }

  async query(soql) {
    const soapBody = `<urn:query><urn:queryString>${soql}</urn:queryString></urn:query>`;
    const soapEnvelope = buildSOAPEnvelope(soapBody, this.sessionId, 'partner');
    const response = await this._sendSOAPRequest(soapEnvelope);
    return parseSOAPResponse(response);
  }

  async _sendSOAPRequest(soapEnvelope) {
    const response = await axios.post(this.endpointUrl, soapEnvelope, {
      headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': '""' }
    });
    return response.data;
  }

  _handleError(error) {
    return new Error(`SOAP API Error: ${error.message}`);
  }
}

module.exports = SalesforceSOAPClient;
