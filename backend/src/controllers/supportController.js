const SupportTicket = require('../models/SupportTicket');

exports.createTicket = async (req, res) => {
  try {
    const { subject, message, priority } = req.body;
    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      message,
      priority
    });
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const tickets = await SupportTicket.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('replies.sender', 'name role');
    
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replyToTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    
    ticket.replies.push({
      sender: req.user._id,
      message
    });
    
    if (req.user.role === 'admin') {
      ticket.status = 'in-progress';
    }
    
    await ticket.save();
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
