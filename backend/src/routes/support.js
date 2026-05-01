const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const {
  createTicket,
  getTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus
} = require('../controllers/supportController');

router.post('/', verifyToken, createTicket);
router.get('/', verifyToken, getTickets);
router.get('/:id', verifyToken, getTicketById);
router.post('/:id/reply', verifyToken, replyToTicket);
router.patch('/:id/status', verifyToken, requireAdmin, updateTicketStatus);

module.exports = router;
