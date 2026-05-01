const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

router.get('/for-user/:userId', recommendationController.getRecommendations);
router.get('/trending', recommendationController.getTrending);

module.exports = router;
