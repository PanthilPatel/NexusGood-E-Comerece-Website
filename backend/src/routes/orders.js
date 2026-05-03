const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const returnController = require('../controllers/returnController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validateCheckout } = require('../middleware/validate');

router.get('/recent-purchases', orderController.getRecentPurchases);

router.use(verifyToken);

router.post('/checkout', validateCheckout, orderController.checkout);
router.get('/my', orderController.getMyOrders);
router.put('/:id/cancel', orderController.cancelMyOrder);
router.get('/:id', orderController.getOrderById);
router.post('/:id/return', returnController.requestReturn);
router.get('/:id/return', returnController.getReturnStatus);
router.get('/:id/invoice', orderController.downloadInvoice);
router.get('/', requireAdmin, orderController.getAllOrders);
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);

module.exports = router;
