/**
 * Deployment Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const deployController = require('../controllers/deployController');

router.use(authenticate);

// Deploy operations
router.post('/deploy', deployController.deploy);
router.get('/deploy/status/:deployId', deployController.checkDeployStatus);

// Validate (checkOnly)
router.post('/validate', deployController.validateDeployment);

// Quick deploy
router.post('/quickDeploy/:validationId', deployController.quickDeploy);

module.exports = router;
