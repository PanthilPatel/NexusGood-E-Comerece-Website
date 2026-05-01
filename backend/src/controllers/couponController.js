const Coupon = require('../models/Coupon');

// POST /api/coupons/validate
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon.' });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached.' });
    }

    if (orderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minOrderAmount}.`,
      });
    }

    let discount = 0;
    if (orderAmount) {
      if (coupon.discountType === 'percentage') {
        discount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount > 0) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.discountValue;
      }
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
      },
      discount: Math.round(discount * 100) / 100,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/coupons — admin create
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiresAt } = req.body;

    if (!code || !discountType || !discountValue || !expiresAt) {
      return res.status(400).json({ message: 'Code, discount type, value, and expiry are required.' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || 0,
      usageLimit: usageLimit || 0,
      expiresAt: new Date(expiresAt),
    });

    res.status(201).json({ message: 'Coupon created.', coupon });
  } catch (error) {
    next(error);
  }
};

// GET /api/coupons — admin list all
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

// PUT /api/coupons/:id — admin toggle active OR update coupon
exports.toggleCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    // If body has update fields, treat as edit; otherwise toggle active
    const { discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiresAt } = req.body;
    if (discountType || discountValue || expiresAt) {
      if (discountType) coupon.discountType = discountType;
      if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
      if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount) || 0;
      if (maxDiscount !== undefined) coupon.maxDiscount = Number(maxDiscount) || 0;
      if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit) || 0;
      if (expiresAt) coupon.expiresAt = new Date(expiresAt);
      await coupon.save();
      return res.json({ message: 'Coupon updated.', coupon });
    }

    // Toggle active
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}.`, coupon });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/coupons/:id — admin delete
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }
    res.json({ message: 'Coupon deleted.' });
  } catch (error) {
    next(error);
  }
};
