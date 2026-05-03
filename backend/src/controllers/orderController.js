const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { sendOrderConfirmation, sendShippingUpdate } = require('../services/emailService');
const { generateInvoicePDF } = require('../services/invoiceService');
const { emitNewOrder } = require('../config/socket');

// POST /api/orders/checkout
exports.checkout = async (req, res, next) => {
  try {
    const { shippingAddress, couponCode, paymentMethod = 'Online' } = req.body;

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone ||
      !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ message: 'Complete shipping address is required.' });
    }

    if (!['Online', 'COD'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method.' });
    }

    // Get user's cart
    let cartItems = [];

    if (req.body.items && req.body.items.length > 0) {
      cartItems = req.body.items;
    } else {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty.' });
      }
      cartItems = cart.items;
    }

    // Verify stock and build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
      if (!item.product) {
        return res.status(400).json({ message: 'One or more products in your cart are no longer available. Please refresh your cart.' });
      }
      if (!item.product.isActive) {
        return res.status(400).json({ message: `"${item.product.name}" is no longer available.` });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for "${item.product.name}". Only ${item.product.stock} left.` });
      }

      const isFlashSaleActive = item.product.isFlashSale && 
                               item.product.flashSaleEnd && 
                               new Date(item.product.flashSaleEnd) > new Date();
      
      const price = isFlashSaleActive ? item.product.flashSalePrice : item.product.price;

      // Calculate realized profit snapshot
      let profit = 0;
      if (item.product.profitType === 'percentage' && item.product.profitValue > 0) {
        profit = (price * item.product.profitValue) / 100;
      } else if (item.product.profitType === 'flat' && item.product.profitValue > 0) {
        profit = item.product.profitValue;
      } else {
        // Fallback: 20% margin if profit not explicitly defined
        profit = price * 0.20;
      }

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: price,
        profit: Math.round(profit),
      });

      subtotal += price * item.quantity;
    }

    // Apply coupon if provided
    let discount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: new Date() },
      });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired coupon.' });
      }

      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit reached.' });
      }

      if (subtotal < coupon.minOrderAmount) {
        return res.status(400).json({ message: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}.` });
      }

      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount > 0) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.discountValue;
      }

      couponId = coupon._id;
      coupon.usedCount += 1;
      await coupon.save();
    }

    // Calculate shipping fee from products
    let shippingFee = 0;
    for (const item of cartItems) {
      shippingFee += (item.product.shippingFee || 0) * item.quantity;
    }

    // COD surcharge and Limit Validation
    const COD_CHARGE = 14;
    const codCharge = paymentMethod === 'COD' ? COD_CHARGE : 0;
    const totalAmount = subtotal + shippingFee + codCharge - discount;

    if (paymentMethod === 'COD' && (totalAmount - codCharge) > 10000) {
      return res.status(400).json({ message: 'Cash on Delivery is only available for orders below ₹10,000. Please use online payment.' });
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      discount,
      codCharge,
      coupon: couponId,
      paymentMethod,
      // COD orders are confirmed immediately (payment on delivery)
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
      status: paymentMethod === 'COD' ? 'processing' : 'pending',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images price')
      .populate('user', 'name email');

    // Reduce stock and clear cart ONLY for COD
    if (paymentMethod === 'COD') {
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, soldCount: item.quantity },
        });
      }
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
      
      // Real-time notification
      emitNewOrder(populatedOrder);
    }

    // Send order confirmation email (non-blocking)
    sendOrderConfirmation(populatedOrder.user, populatedOrder).catch(() => {});

    res.status(201).json({ message: 'Order placed successfully.', order: populatedOrder });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price')
      .populate('user', 'name email')
      .populate('coupon', 'code discountType discountValue');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Ensure user can only view their own orders (unless admin)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders — admin all orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {
      $or: [
        { paymentMethod: 'COD' },
        { paymentMethod: 'Online', paymentStatus: 'paid' }
      ]
    };
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/cancel — user cancel their own order
exports.cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled.' });
    }

    order.status = 'cancelled';
    
    // 1. Restore Stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }

    // 2. Process Refund to Wallet if paid
    if (order.paymentStatus === 'paid') {
      const Wallet = require('../models/Wallet');
      let wallet = await Wallet.findOne({ user: req.user._id });
      
      if (!wallet) {
        wallet = new Wallet({ user: req.user._id, balance: 0, transactions: [] });
      }

      wallet.balance += order.totalAmount;
      wallet.transactions.push({
        type: 'credit',
        amount: order.totalAmount,
        description: `Refund for cancelled order #${order._id.toString().slice(-6).toUpperCase()}`,
        order: order._id,
        status: 'completed'
      });

      await wallet.save();
      order.paymentStatus = 'refunded';
    }

    await order.save();
    res.json({ message: 'Order cancelled successfully.', order });
  } catch (error) {
    next(error);
  }
};
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email').populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // If cancelled, restore stock and refund if paid
    if (status === 'cancelled') {
      // 1. Restore Stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product._id || item.product, {
          $inc: { stock: item.quantity, soldCount: -item.quantity },
        });
      }

      // 2. Process Refund to Wallet if order was paid
      if (order.paymentStatus === 'paid') {
        const Wallet = require('../models/Wallet');
        let wallet = await Wallet.findOne({ user: order.user });
        
        // Create wallet if doesn't exist
        if (!wallet) {
          wallet = new Wallet({ user: order.user, balance: 0, transactions: [] });
        }

        wallet.balance += order.totalAmount;
        wallet.transactions.push({
          type: 'credit',
          amount: order.totalAmount,
          description: `Refund for cancelled order #${order._id.toString().slice(-6).toUpperCase()}`,
          order: order._id,
          status: 'completed'
        });

        await wallet.save();
        
        // Update order payment status to refunded
        order.paymentStatus = 'refunded';
        await order.save();
      }
    }

    res.json({ message: 'Order status updated.', order });

    // Send shipping update email (non-blocking)
    if (['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      const orderUser = await User.findById(order.user);
      if (orderUser) sendShippingUpdate(orderUser, order).catch(() => {});
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id/invoice — Download PDF invoice
exports.downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Auth check
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    generateInvoicePDF(order, order.user, res);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/recent-purchases — Public endpoint for social proof
exports.getRecentPurchases = async (req, res, next) => {
  try {
    const query = {
      status: { $nin: ['cancelled', 'pending'] },
      $or: [
        { paymentMethod: 'COD' },
        { paymentMethod: 'Online', paymentStatus: 'paid' }
      ]
    };

    const orders = await Order.find(query)
      .select('shippingAddress.city items createdAt')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(10);

    // Anonymize city (optional, but good for privacy)
    const formattedOrders = orders.map(order => ({
      city: order.shippingAddress?.city || 'India',
      productName: order.items[0]?.product?.name || 'a premium item',
      productImage: order.items[0]?.product?.images?.[0]?.url || '',
      timeAgo: order.createdAt,
    }));

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    next(error);
  }
};
