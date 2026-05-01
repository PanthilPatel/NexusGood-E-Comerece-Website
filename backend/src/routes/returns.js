const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Admin
router.get('/', verifyToken, requireAdmin, returnController.getAllReturns);
router.patch('/:id', verifyToken, requireAdmin, returnController.processReturn);

module.exports = router;
