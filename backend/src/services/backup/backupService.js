/**
 * Backup Service
 * 
 * Retrieves and stores Salesforce metadata
 * Manages backup history and retention
 */

const fs = require('fs').promises;
const path = require('path');
const SalesforceMetadataClient = require('../salesforce/metadataClient');
const { extractZip } = require('../../utils/zipHelper');
const config = require('../../config/env');
const { logger } = require('../../utils/logger');

class BackupService {
  /**
   * Create backup of Salesforce org
   * @param {Object} sessionInfo - SF session
   * @param {Array} metadataTypes - Types to backup
   * @returns {Promise<Object>} Backup info
   */
  static async createBackup(sessionInfo, metadataTypes) {
    try {
      const { instanceUrl, accessToken, orgId } = sessionInfo;
      const client = new SalesforceMetadataClient(instanceUrl, accessToken);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup_${orgId}_${timestamp}`;
      const backupDir = path.join(config.backup.directory, backupId);

      logger.info('Starting backup', { backupId, types: metadataTypes.length });

      // Build retrieve request
      const retrieveRequest = {
        types: metadataTypes.map(type => ({
          name: type,
          members: ['*']
        }))
      };

      // Initiate retrieve
      const asyncResult = await client.retrieve(retrieveRequest);

      // Poll for completion
      const retrieveResult = await this._pollRetrieveStatus(client, asyncResult.id);

      // Extract ZIP
      await fs.mkdir(backupDir, { recursive: true });
      await extractZip(retrieveResult.zipBuffer, backupDir);

      // Save metadata
      const metadataPath = path.join(backupDir, 'backup-metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify({
        backupId,
        orgId,
        timestamp: new Date().toISOString(),
        metadataTypes,
        componentCount: retrieveResult.fileProperties?.length || 0
      }, null, 2));

      logger.info('Backup completed', { backupId, path: backupDir });

      return {
        backupId,
        path: backupDir,
        timestamp,
        componentCount: retrieveResult.fileProperties?.length || 0
      };
    } catch (error) {
      logger.error('Backup failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Poll retrieve status
   */
  static async _pollRetrieveStatus(client, retrieveId) {
    const maxAttempts = 60;
    const pollInterval = 5000;

    for (let i = 0; i < maxAttempts; i++) {
      const status = await client.checkRetrieveStatus(retrieveId);

      if (status.done) {
        if (status.success) {
          return status;
        } else {
          throw new Error(`Retrieve failed: ${status.errorMessage}`);
        }
      }

      logger.info('Retrieve in progress', { retrieveId, attempt: i + 1 });
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Retrieve timeout');
  }

  /**
   * List all backups
   */
  static async listBackups(orgId = null) {
    try {
      const backupDir = config.backup.directory;
      await fs.mkdir(backupDir, { recursive: true });
      
      const entries = await fs.readdir(backupDir);
      const backups = [];

      for (const entry of entries) {
        if (orgId && !entry.includes(orgId)) continue;

        const metadataPath = path.join(backupDir, entry, 'backup-metadata.json');
        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          backups.push(metadata);
        } catch (err) {
          logger.warn(`Invalid backup directory: ${entry}`);
        }
      }

      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      logger.error('List backups failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete old backups based on retention policy
   */
  static async cleanupOldBackups() {
    try {
      const backups = await this.listBackups();
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - config.backup.retentionDays);

      let deletedCount = 0;

      for (const backup of backups) {
        const backupDate = new Date(backup.timestamp);
        if (backupDate < retentionDate) {
          const backupPath = path.join(config.backup.directory, backup.backupId);
          await fs.rm(backupPath, { recursive: true, force: true });
          deletedCount++;
          logger.info('Deleted old backup', { backupId: backup.backupId });
        }
      }

      logger.info('Backup cleanup completed', { deletedCount });
      return { deletedCount };
    } catch (error) {
      logger.error('Backup cleanup failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = BackupService;
