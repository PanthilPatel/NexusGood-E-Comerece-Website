const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/validate', verifyToken, couponController.validateCoupon);
router.post('/', verifyToken, requireAdmin, couponController.createCoupon);
router.get('/', verifyToken, requireAdmin, couponController.getCoupons);
router.put('/:id', verifyToken, requireAdmin, couponController.toggleCoupon);
router.delete('/:id', verifyToken, requireAdmin, couponController.deleteCoupon);

module.exports = router;
