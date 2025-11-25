/**
 * Frontend Configuration
 * 
 * IMPORTANT: All Salesforce API calls must go through the backend
 * Direct calls to Salesforce from the frontend will fail due to CORS
 */

const config = {
  // Backend API URL
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',

  // Request timeout
  timeout: 30000,

  // Session storage keys
  storage: {
    sessionToken: 'sf_session_token',
    orgId: 'sf_org_id',
    orgInfo: 'sf_org_info'
  }
};

export default config;
