const Cart = require('../models/Cart');

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price comparePrice images stock isActive',
    });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    // Filter out inactive products
    cart.items = cart.items.filter(item => item.product && item.product.isActive);
    res.json({ cart });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/add
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Find existing item (comparing ID strings to handle both ObjectId and String formats)
    const existingItem = cart.items.find(
      item => item.product.toString() === (typeof productId === 'object' ? productId._id.toString() : productId.toString())
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ 
        product: typeof productId === 'object' ? productId._id : productId, 
        quantity: Number(quantity) 
      });
    }

    await cart.save();

    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price comparePrice images stock isActive',
    });

    res.json({ message: 'Item added to cart.', cart });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/update
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined || quantity === null) {
      return res.status(400).json({ message: 'Product ID and quantity are required.' });
    }

    if (Number(quantity) < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    item.quantity = Number(quantity);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price comparePrice images stock isActive',
    });

    res.json({ message: 'Cart updated.', cart: populated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/remove/:productId
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price comparePrice images stock isActive',
    });

    res.json({ message: 'Item removed from cart.', cart: populated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/clear
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared.', cart: { items: [] } });
  } catch (error) {
    next(error);
  }
};
