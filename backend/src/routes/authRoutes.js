/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// OAuth flow
router.get('/authorize', authController.authorize);
router.get('/callback', authController.callback);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// User info
router.get('/userinfo', authController.getUserInfo);

module.exports = router;
