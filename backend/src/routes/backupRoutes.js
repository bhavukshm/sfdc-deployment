/**
 * Backup Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const backupController = require('../controllers/backupController');

router.use(authenticate);

// Backup operations
router.post('/create', backupController.createBackup);
router.get('/list', backupController.listBackups);
router.get('/:backupId', backupController.getBackup);
router.delete('/:backupId', backupController.deleteBackup);

// Cleanup old backups
router.post('/cleanup', backupController.cleanupOldBackups);

module.exports = router;
