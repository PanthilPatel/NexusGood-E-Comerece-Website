const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  lastModifiedAt: { type: Date, default: Date.now },
  recoverySentAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// User is already unique in the schema definition
cartSchema.index({ lastModifiedAt: 1 });

module.exports = mongoose.model('Cart', cartSchema);
