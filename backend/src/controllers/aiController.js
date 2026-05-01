const aiService = require('../services/aiService');

// POST /api/ai/chat
exports.chatWithStylist = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const response = await aiService.getAIStylistResponse(message, history || []);
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};
