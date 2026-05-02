const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin);

router.get('/revenue', analyticsController.getRevenue);
router.get('/sales-trend', analyticsController.getSalesTrend);
router.get('/top-products', analyticsController.getTopProducts);
router.get('/user-stats', analyticsController.getUserStats);
router.get('/order-stats', analyticsController.getOrderStats);
router.get('/inventory', analyticsController.getLowStock);
router.get('/predictions', analyticsController.getPredictions);
router.get('/overview', analyticsController.getOverview);
router.get('/summary', analyticsController.getSummary);

module.exports = router;
