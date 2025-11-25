/**
 * Type Definitions (JSDoc style)
 * Can be converted to TypeScript if needed
 */

/**
 * @typedef {Object} SalesforceSession
 * @property {string} sessionToken - Session token
 * @property {string} orgId - Organization ID
 * @property {string} accessToken - Access token
 * @property {string} refreshToken - Refresh token
 * @property {string} instanceUrl - Instance URL
 * @property {string} userId - User ID
 * @property {string} username - Username
 */

/**
 * @typedef {Object} MetadataType
 * @property {string} name - Metadata type name
 * @property {Array<string>} members - Member names
 */

/**
 * @typedef {Object} DeploymentPackage
 * @property {Array<MetadataType>} types - Metadata types to deploy
 * @property {string} apiVersion - API version
 * @property {Array<DeploymentFile>} files - Component files
 */

/**
 * @typedef {Object} DeploymentFile
 * @property {string} path - File path
 * @property {string} content - File content
 */

/**
 * @typedef {Object} DeployResult
 * @property {string} deployId - Deployment ID
 * @property {string} status - Deployment status
 * @property {boolean} success - Success flag
 * @property {Object} details - Deployment details
 * @property {Array} componentSuccesses - Successful components
 * @property {Array} componentFailures - Failed components
 */

/**
 * @typedef {Object} ComparisonResult
 * @property {Array} onlyInSource - Items only in source
 * @property {Array} onlyInTarget - Items only in target
 * @property {Array} modified - Modified items
 * @property {Array} identical - Identical items
 */

/**
 * @typedef {Object} BackupInfo
 * @property {string} backupId - Backup ID
 * @property {string} orgId - Organization ID
 * @property {string} timestamp - Backup timestamp
 * @property {Array<string>} metadataTypes - Backed up types
 * @property {number} componentCount - Number of components
 * @property {string} path - Backup path
 */

export {};
