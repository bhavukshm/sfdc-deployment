/**
 * Backup Controller
 */

const BackupService = require('../services/backup/backupService');

class BackupController {
  static async createBackup(req, res, next) {
    try {
      const { metadataTypes } = req.body;
      const sessionInfo = req.sfSession;
      
      const result = await BackupService.createBackup(sessionInfo, metadataTypes);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async listBackups(req, res, next) {
    try {
      const { orgId } = req.query;
      
      const backups = await BackupService.listBackups(orgId);
      res.json(backups);
    } catch (error) {
      next(error);
    }
  }

  static async getBackup(req, res, next) {
    try {
      const { backupId } = req.params;
      
      // Implementation to retrieve specific backup
      res.json({ message: 'Get backup details', backupId });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBackup(req, res, next) {
    try {
      const { backupId } = req.params;
      
      // Implementation to delete backup
      res.json({ message: 'Backup deleted', backupId });
    } catch (error) {
      next(error);
    }
  }

  static async cleanupOldBackups(req, res, next) {
    try {
      const result = await BackupService.cleanupOldBackups();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BackupController;
