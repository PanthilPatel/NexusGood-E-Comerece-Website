const Wishlist = require('../models/Wishlist');

// GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name price comparePrice images avgRating numReviews stock isActive',
    });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    // Filter out inactive products
    wishlist.products = wishlist.products.filter(p => p && p.isActive);
    res.json({ wishlist });
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist/toggle/:productId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(
      p => p.toString() === productId
    );

    let action;
    if (index > -1) {
      wishlist.products.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.products.push(productId);
      action = 'added';
    }

    await wishlist.save();

    wishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name price comparePrice images avgRating numReviews stock isActive',
    });

    res.json({ message: `Product ${action} from wishlist.`, action, wishlist });
  } catch (error) {
    next(error);
  }
};
