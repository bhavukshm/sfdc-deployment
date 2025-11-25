/**
 * ZIP Utilities for Metadata API
 * Create and extract ZIP packages
 */

const AdmZip = require('adm-zip');
const { buildPackageXML } = require('./soapHelper');

/**
 * Create deployment package ZIP
 * @param {Object} packageData - Package manifest and files
 * @returns {Buffer} ZIP buffer
 */
async function createDeploymentPackage(packageData) {
  const zip = new AdmZip();

  // Add package.xml
  const packageXML = buildPackageXML(packageData.types, packageData.apiVersion);
  zip.addFile('package.xml', Buffer.from(packageXML, 'utf8'));

  // Add component files
  if (packageData.files) {
    packageData.files.forEach(file => {
      zip.addFile(file.path, Buffer.from(file.content, 'utf8'));
    });
  }

  return zip.toBuffer();
}

/**
 * Extract ZIP to directory
 * @param {Buffer} zipBuffer - ZIP buffer
 * @param {string} targetDir - Target directory
 */
async function extractZip(zipBuffer, targetDir) {
  const zip = new AdmZip(zipBuffer);
  zip.extractAllTo(targetDir, true);
}

/**
 * Read ZIP contents
 * @param {Buffer} zipBuffer - ZIP buffer
 * @returns {Array} File entries
 */
function readZipContents(zipBuffer) {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  
  return entries.map(entry => ({
    name: entry.entryName,
    isDirectory: entry.isDirectory,
    size: entry.header.size,
    content: entry.isDirectory ? null : entry.getData().toString('utf8')
  }));
}

module.exports = { createDeploymentPackage, extractZip, readZipContents };
