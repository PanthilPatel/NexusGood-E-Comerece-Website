const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public route to check maintenance mode
router.get('/:key', settingsController.getSetting);

// Admin route to update settings
router.put('/:key', verifyToken, requireAdmin, settingsController.updateSetting);

module.exports = router;
