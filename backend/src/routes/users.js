const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin);

router.get('/', userController.getUsers);
router.put('/:id/role', userController.updateUserRole);

module.exports = router;
