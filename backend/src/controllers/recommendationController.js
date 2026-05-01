const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// GET /api/recommendations/for-user/:userId
exports.getRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { recentlyViewed } = req.query;
    let recommendedProducts = [];

    // 1. Get products from user's order history
    const userOrders = await Order.find({ user: userId }).select('items.product');
    const purchasedProductIds = userOrders.flatMap(order =>
      order.items.map(item => item.product.toString())
    );

    if (purchasedProductIds.length > 0) {
      // Find other users who bought the same products
      const coUsers = await Order.find({
        user: { $ne: userId },
        'items.product': { $in: purchasedProductIds },
      }).select('items.product');

      // Collect co-purchased product IDs
      const coPurchasedIds = new Set();
      coUsers.forEach(order => {
        order.items.forEach(item => {
          const pid = item.product.toString();
          if (!purchasedProductIds.includes(pid)) {
            coPurchasedIds.add(pid);
          }
        });
      });

      if (coPurchasedIds.size > 0) {
        const coProducts = await Product.find({
          _id: { $in: Array.from(coPurchasedIds) },
          isActive: true,
        })
          .populate('category', 'name slug')
          .limit(8);
        recommendedProducts = coProducts;
      }
    }

    // 2. If not enough, use recently viewed products' categories
    if (recommendedProducts.length < 8 && recentlyViewed) {
      const viewedIds = recentlyViewed.split(',').filter(Boolean);
      if (viewedIds.length > 0) {
        const viewedProducts = await Product.find({
          _id: { $in: viewedIds },
          isActive: true,
        }).select('category');

        const categories = viewedProducts.map(p => p.category);
        const excludeIds = [
          ...recommendedProducts.map(p => p._id),
          ...viewedIds.map(id => new mongoose.Types.ObjectId(id)),
          ...purchasedProductIds.map(id => new mongoose.Types.ObjectId(id)),
        ];

        const viewBased = await Product.find({
          category: { $in: categories },
          _id: { $nin: excludeIds },
          isActive: true,
        })
          .populate('category', 'name slug')
          .sort({ avgRating: -1 })
          .limit(8 - recommendedProducts.length);

        recommendedProducts = [...recommendedProducts, ...viewBased];
      }
    }

    // 3. Fall back to top-rated products
    if (recommendedProducts.length < 8) {
      const excludeIds = recommendedProducts.map(p => p._id);
      const topRated = await Product.find({
        _id: { $nin: excludeIds },
        isActive: true,
      })
        .populate('category', 'name slug')
        .sort({ avgRating: -1, soldCount: -1 })
        .limit(8 - recommendedProducts.length);

      recommendedProducts = [...recommendedProducts, ...topRated];
    }

    res.json({ products: recommendedProducts.slice(0, 8) });
  } catch (error) {
    next(error);
  }
};

// GET /api/recommendations/trending
exports.getTrending = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get products with most sales in last 30 days
    const trendingOrderItems = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 8 },
    ]);

    const productIds = trendingOrderItems.map(item => item._id);

    let products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).populate('category', 'name slug');

    // If not enough trending, fill with overall best sellers
    if (products.length < 8) {
      const excludeIds = products.map(p => p._id);
      const fillProducts = await Product.find({
        _id: { $nin: excludeIds },
        isActive: true,
      })
        .populate('category', 'name slug')
        .sort({ soldCount: -1 })
        .limit(8 - products.length);
      products = [...products, ...fillProducts];
    }

    res.json({ products });
  } catch (error) {
    next(error);
  }
};
