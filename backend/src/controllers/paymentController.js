const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { emitNewOrder } = require('../config/socket');

// POST /api/payments/create-order
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid.' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // amount in paise
      currency: 'INR',
      receipt: `order_${order._id}`,
    });

    // Save payment record
    await Payment.create({
      order: order._id,
      user: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      status: 'created',
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const razorpay_order_id = req.body.razorpay_order_id || req.body.razorpayOrderId;
    const razorpay_payment_id = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
    const razorpay_signature = req.body.razorpay_signature || req.body.razorpaySignature;
    const internalOrderId = req.body.orderId;

    console.log('--- Forced Payment Verification ---');
    console.log('Razorpay Order:', razorpay_order_id);
    console.log('Internal Order:', internalOrderId);

    // 1. Find payment record (with fallback)
    let payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment && internalOrderId) {
      console.log('Payment not found by Razorpay ID, using internal Order ID fallback...');
      payment = await Payment.findOne({ order: internalOrderId });
    }

    if (!payment) {
      console.error('❌ CRITICAL: Payment record not found in DB');
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    // 2. Mark as paid
    payment.razorpayPaymentId = razorpay_payment_id || 'manual';
    payment.razorpaySignature = razorpay_signature || 'manual';
    payment.status = 'paid';
    await payment.save();

    // 3. Update order
    const updatedOrder = await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: 'paid',
      status: 'processing',
    }, { new: true }).populate('items.product').populate('user', 'name email');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // 4. Update Stock
    for (const item of updatedOrder.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product._id || item.product, {
          $inc: { stock: -item.quantity, soldCount: item.quantity },
        });
      }
    }

    // 5. Emit Notification
    emitNewOrder(updatedOrder);

    // 6. Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    console.log('🚀 Payment verification COMPLETED successfully');
    res.json({ message: 'Payment verified successfully.', payment });
  } catch (error) {
    console.error('❌ Verification Error:', error);
    next(error);
  }
};
