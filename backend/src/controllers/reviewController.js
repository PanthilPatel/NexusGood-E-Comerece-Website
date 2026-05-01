const Review = require('../models/Review');
const Product = require('../models/Product');

// POST /api/reviews/:productId
exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ user: req.user._id, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
    });

    // Update product avgRating and numReviews
    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      product.avgRating = Math.round(stats[0].avgRating * 10) / 10;
      product.numReviews = stats[0].numReviews;
      await product.save();
    }

    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({ message: 'Review submitted.', review: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/:productId
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Only show approved reviews to customers
    const query = { product: productId, status: 'approved' };
    
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get rating breakdown (only for approved reviews)
    const breakdown = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId), status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const ratingBreakdown = {};
    for (let i = 1; i <= 5; i++) {
      const found = breakdown.find(b => b._id === i);
      ratingBreakdown[i] = found ? found.count : 0;
    }

    res.json({
      reviews,
      ratingBreakdown,
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

// GET /api/reviews/admin/all — admin view all for moderation
exports.getAllReviewsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    
    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    const total = await Review.countDocuments(query);
    
    res.json({ success: true, data: reviews, total });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/reviews/:id/moderate
exports.moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body; // approved | rejected
    const review = await Review.findById(req.params.id);
    
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    
    review.status = status;
    await review.save();

    // Recalculate product avgRating and numReviews ONLY with approved reviews
    const stats = await Review.aggregate([
      { $match: { product: review.product, status: 'approved' } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    const product = await Product.findById(review.product);
    if (stats.length > 0) {
      product.avgRating = Math.round(stats[0].avgRating * 10) / 10;
      product.numReviews = stats[0].numReviews;
    } else {
      product.avgRating = 0;
      product.numReviews = 0;
    }
    await product.save();

    res.json({ success: true, message: `Review ${status}.`, review });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id — admin delete
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Recalculate product rating (only approved)
    const stats = await Review.aggregate([
      { $match: { product: review.product, status: 'approved' } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(review.product, {
        avgRating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].numReviews,
      });
    } else {
      await Product.findByIdAndUpdate(review.product, {
        avgRating: 0,
        numReviews: 0,
      });
    }

    res.json({ message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

