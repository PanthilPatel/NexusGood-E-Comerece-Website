const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Rate-limited auth routes
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login',    authLimiter, validateLogin,    authController.login);
router.post('/refresh',  authController.refresh);
router.post('/logout',   authController.logout);

// Protected routes
router.get('/me',                    verifyToken, authController.getMe);
router.put('/profile',               verifyToken, authController.updateProfile);
router.put('/change-password',       verifyToken, authController.changePassword);
router.post('/addresses',            verifyToken, authController.addAddress);
router.delete('/addresses/:addressId', verifyToken, authController.deleteAddress);

module.exports = router;
