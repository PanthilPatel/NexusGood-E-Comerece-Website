const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: 5000,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  comparePrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  }],
  tags: [{ type: String, trim: true }],
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  costPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  profitType: {
    type: String,
    enum: ['flat', 'percentage'],
    default: 'percentage',
  },
  profitValue: {
    type: Number,
    default: 0,
    min: 0,
  },
  gst: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  colors: [{
    name: { type: String, trim: true },
    hex:  { type: String, trim: true },
  }],
  isFlashSale: {
    type: Boolean,
    default: false,
  },
  flashSalePrice: {
    type: Number,
    min: 0,
  },
  flashSaleEnd: {
    type: Date,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Text index for search
productSchema.index({ name: 'text', tags: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ avgRating: -1 });
productSchema.index({ soldCount: -1 });

module.exports = mongoose.model('Product', productSchema);
