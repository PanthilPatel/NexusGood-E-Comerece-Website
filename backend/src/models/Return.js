const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: [true, 'Return reason is required.'],
    maxlength: 500,
    trim: true,
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'refunded'],
    default: 'requested',
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  adminNote: {
    type: String,
    default: '',
    maxlength: 500,
  },
}, { timestamps: true });

returnSchema.index({ user: 1, createdAt: -1 });
returnSchema.index({ status: 1 });
returnSchema.index({ order: 1 }, { unique: true });

module.exports = mongoose.model('Return', returnSchema);
