/**
 * Comparison Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const compareController = require('../controllers/compareController');

router.use(authenticate);

// Compare metadata between orgs
router.post('/metadata', compareController.compareMetadata);
router.post('/sobjects', compareController.compareSObjects);
router.post('/components', compareController.compareComponents);

module.exports = router;
