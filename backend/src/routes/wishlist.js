const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', wishlistController.getWishlist);
router.post('/toggle/:productId', wishlistController.toggleWishlist);

module.exports = router;
