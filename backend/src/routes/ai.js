const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');

// Chat can be public or private, but let's make it private for "members"
router.use(verifyToken);

router.post('/chat', aiController.chatWithStylist);

module.exports = router;
