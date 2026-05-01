const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validators
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  handleValidation,
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];

// Product validators
const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required.').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('category').notEmpty().withMessage('Category is required.'),
  handleValidation,
];

// Coupon validators
const validateCoupon = [
  body('code').trim().notEmpty().withMessage('Coupon code is required.').isLength({ max: 20 }),
  body('discountType').isIn(['percentage', 'flat']).withMessage('Discount type must be percentage or flat.'),
  body('discountValue').isFloat({ min: 0.01 }).withMessage('Discount value must be positive.'),
  body('expiresAt').isISO8601().withMessage('Valid expiry date is required.'),
  handleValidation,
];

// Review validators
const validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('comment').trim().notEmpty().withMessage('Comment is required.').isLength({ max: 1000 }),
  handleValidation,
];

// Order validators
const validateCheckout = [
  body('shippingAddress.name').trim().notEmpty().withMessage('Recipient name is required.'),
  body('shippingAddress.phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits.'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Street address is required.'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required.'),
  body('shippingAddress.pincode').matches(/^\d{6}$/).withMessage('Pincode must be 6 digits.'),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateCoupon,
  validateReview,
  validateCheckout,
  handleValidation,
};
