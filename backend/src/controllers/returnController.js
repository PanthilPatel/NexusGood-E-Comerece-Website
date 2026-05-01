const Return = require('../models/Return');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const razorpay = require('../config/razorpay');
const { sendReturnUpdate, sendWalletUpdate } = require('../services/emailService');
const walletController = require('./walletController');

const RETURN_WINDOW_DAYS = 7;

// POST /api/orders/:id/return — customer requests return
exports.requestReturn = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      return res.status(400).json({ message: 'Return reason is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Returns are only allowed for delivered orders.' });
    }

    // Check return window
    const deliveredAt = order.updatedAt;
    const daysSince = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > RETURN_WINDOW_DAYS) {
      return res.status(400).json({ message: `Return window of ${RETURN_WINDOW_DAYS} days has expired.` });
    }

    // Check if return already exists
    const existing = await Return.findOne({ order: order._id });
    if (existing) {
      return res.status(400).json({ message: 'A return request already exists for this order.' });
    }

    const returnRequest = await Return.create({
      order: order._id,
      user: req.user._id,
      reason: reason.trim(),
      refundAmount: order.totalAmount,
    });

    res.status(201).json({ message: 'Return request submitted.', return: returnRequest });
  } catch (error) {
    next(error);
  }
};

// GET /api/returns — admin list all returns
exports.getAllReturns = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Return.countDocuments(query);
    const returns = await Return.find(query)
      .populate('user', 'name email')
      .populate({ path: 'order', populate: { path: 'items.product', select: 'name price' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, data: { returns, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/returns/:id — admin approve or reject
exports.processReturn = async (req, res, next) => {
  try {
    const { action, refundAmount, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Action must be approved or rejected.' });
    }

    const returnRequest = await Return.findById(req.params.id).populate('user', 'name email');
    if (!returnRequest) return res.status(404).json({ message: 'Return request not found.' });
    if (returnRequest.status !== 'requested') {
      return res.status(400).json({ message: 'This return has already been processed.' });
    }

    if (action === 'rejected') {
      returnRequest.status = 'rejected';
      returnRequest.adminNote = adminNote || '';
      await returnRequest.save();
      sendReturnUpdate(returnRequest.user, returnRequest, { _id: returnRequest.order }).catch(() => {});
      return res.json({ message: 'Return rejected.', return: returnRequest });
    }

    // Approved — attempt refund
    const order = await Order.findById(returnRequest.order);
    const finalRefundAmount = refundAmount || returnRequest.refundAmount;
    const refundToWallet = req.body.refundMethod === 'wallet';

    if (refundToWallet) {
      try {
        await walletController.processWalletTransaction(
          order.user,
          'credit',
          finalRefundAmount,
          `Refund for order #${order._id.toString().slice(-8).toUpperCase()}`,
          order._id
        );
        returnRequest.status = 'refunded';
        await Order.findByIdAndUpdate(order._id, { paymentStatus: 'refunded' });

        // Send wallet update email
        sendWalletUpdate(
          returnRequest.user, 
          finalRefundAmount, 
          'credit', 
          `Refund for order #${order._id.toString().slice(-8).toUpperCase()}`
        ).catch(() => {});
      } catch (err) {
        console.error('Wallet refund error:', err.message);
        returnRequest.status = 'approved';
      }
    } else if (order.paymentMethod === 'Online' && order.paymentStatus === 'paid') {
      const payment = await Payment.findOne({ order: order._id, status: 'paid' });
      if (payment?.razorpayPaymentId) {
        try {
          await razorpay.payments.refund(payment.razorpayPaymentId, {
            amount: Math.round(finalRefundAmount * 100), // paise
          });
          returnRequest.status = 'refunded';
          await Order.findByIdAndUpdate(order._id, { paymentStatus: 'refunded' });
        } catch (rzpErr) {
          console.error('Razorpay refund error:', rzpErr.message);
          returnRequest.status = 'approved'; // mark approved, manual refund needed
        }
      } else {
        returnRequest.status = 'approved';
      }
    } else {
      // COD — just mark approved (manual cash refund)
      returnRequest.status = 'approved';
    }

    returnRequest.refundAmount = finalRefundAmount;
    returnRequest.adminNote = adminNote || '';
    await returnRequest.save();

    sendReturnUpdate(returnRequest.user, returnRequest, order).catch(() => {});
    res.json({ message: `Return ${returnRequest.status}.`, return: returnRequest });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id/return — customer check return status
exports.getReturnStatus = async (req, res, next) => {
  try {
    const returnRequest = await Return.findOne({ order: req.params.id });
    if (!returnRequest) return res.status(404).json({ message: 'No return request found.' });
    res.json({ return: returnRequest });
  } catch (error) {
    next(error);
  }
};
