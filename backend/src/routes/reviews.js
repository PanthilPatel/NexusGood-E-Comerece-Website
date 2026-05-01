const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/:productId', verifyToken, reviewController.createReview);
router.get('/:productId', reviewController.getProductReviews);

// Admin moderation
router.get('/admin/all', verifyToken, requireAdmin, reviewController.getAllReviewsAdmin);
router.patch('/:id/moderate', verifyToken, requireAdmin, reviewController.moderateReview);
router.delete('/:id', verifyToken, requireAdmin, reviewController.deleteReview);

module.exports = router;
