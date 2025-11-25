/**
 * Cron Job Scheduler
 * Handles scheduled tasks like automated backups
 */

const cron = require('node-cron');
const BackupService = require('../services/backup/backupService');
const config = require('../config/env');
const { logger } = require('../utils/logger');

function setupCronJobs() {
  // Scheduled backup job
  if (config.backup.enableScheduled) {
    cron.schedule(config.backup.cronSchedule, async () => {
      logger.info('Running scheduled backup cleanup');
      try {
        await BackupService.cleanupOldBackups();
      } catch (error) {
        logger.error('Scheduled backup cleanup failed', { error: error.message });
      }
    });
  }

  logger.info('Cron jobs initialized');
}

module.exports = { setupCronJobs };
