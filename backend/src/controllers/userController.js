const User = require('../models/User');
const Order = require('../models/Order');

// GET /api/users
// Admin: get all users with pagination and search
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get order counts for each user
    const userIds = users.map(u => u._id);
    const orderCounts = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);

    const usersWithOrderCount = users.map(user => {
      const countDoc = orderCounts.find(oc => oc._id.toString() === user._id.toString());
      return {
        ...user.toObject(),
        orderCount: countDoc ? countDoc.count : 0
      };
    });

    res.json({
      success: true,
      data: {
        users: usersWithOrderCount,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id/role
// Admin: toggle user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!role || !['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required (customer or admin).' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent changing your own role (to avoid accidentally locking yourself out)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    user.role = role;
    await user.save();

    res.json({ message: `User role updated to ${role}.`, user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }});
  } catch (error) {
    next(error);
  }
};
