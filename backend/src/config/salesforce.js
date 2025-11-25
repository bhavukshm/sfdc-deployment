/**
 * Salesforce API Configuration
 * Defines API endpoints and constants
 */

const config = require('./env');

const SF_CONFIG = {
  // Base URLs
  loginUrl: config.salesforce.loginUrl,
  apiVersion: config.salesforce.apiVersion,

  // OAuth endpoints
  oauth: {
    authorizeUrl: `${config.salesforce.loginUrl}/services/oauth2/authorize`,
    tokenUrl: `${config.salesforce.loginUrl}/services/oauth2/token`,
    revokeUrl: `${config.salesforce.loginUrl}/services/oauth2/revoke`,
    userInfoUrl: `${config.salesforce.loginUrl}/services/oauth2/userinfo`
  },

  // API endpoints (appended to instance URL)
  endpoints: {
    // REST API
    rest: `/services/data/v${config.salesforce.apiVersion}`,
    
    // Tooling API
    tooling: `/services/data/v${config.salesforce.apiVersion}/tooling`,
    
    // Metadata API (SOAP)
    metadata: `/services/Soap/m/${config.salesforce.apiVersion}`,
    
    // Partner API (SOAP)
    partner: `/services/Soap/u/${config.salesforce.apiVersion}`,
    
    // Apex REST
    apexRest: `/services/apexrest`
  },

  // Metadata API Deploy options
  deployOptions: {
    allowMissingFiles: false,
    autoUpdatePackage: false,
    checkOnly: false,
    ignoreWarnings: false,
    performRetrieve: false,
    purgeOnDelete: false,
    rollbackOnError: true,
    runTests: [],
    singlePackage: true,
    testLevel: 'NoTestRun'
  },

  // Retrieve options
  retrieveOptions: {
    apiVersion: config.salesforce.apiVersion,
    singlePackage: true,
    unpackaged: null
  },

  // Metadata types to retrieve
  metadataTypes: [
    'ApexClass',
    'ApexTrigger',
    'ApexPage',
    'ApexComponent',
    'AuraDefinitionBundle',
    'LightningComponentBundle',
    'CustomObject',
    'CustomField',
    'CustomTab',
    'Layout',
    'PermissionSet',
    'Profile',
    'ValidationRule',
    'Workflow',
    'Flow',
    'CustomApplication',
    'StaticResource',
    'EmailTemplate'
  ],

  // API limits
  limits: {
    maxQuerySize: 2000,
    maxBatchSize: 200,
    maxZipSizeMB: 39,
    maxDeploymentPackageSizeMB: 400
  }
};

module.exports = SF_CONFIG;
