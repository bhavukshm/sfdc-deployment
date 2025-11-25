/**
 * Metadata Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const metadataController = require('../controllers/metadataController');

// All routes require authentication
router.use(authenticate);

// List and describe
router.get('/describe', metadataController.describeMetadata);
router.get('/list/:type', metadataController.listMetadata);

// Retrieve operations
router.post('/retrieve', metadataController.retrieve);
router.get('/retrieve/status/:retrieveId', metadataController.checkRetrieveStatus);

// Query metadata via Tooling API
router.post('/query', metadataController.queryMetadata);

module.exports = router;
