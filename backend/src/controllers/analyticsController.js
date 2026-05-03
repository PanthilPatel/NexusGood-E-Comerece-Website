const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * REVENUE POLICY:
 * - Online orders: counted when paymentStatus = 'paid'
 * - COD orders: counted ONLY when status = 'delivered' (cash collected on delivery)
 *
 * SALES COUNT POLICY:
 * - All non-cancelled orders
 */

// Safe match builder — wraps $or + extra fields in $and to avoid key conflicts
const revenueFilter = (extra = {}) => {
  const base = {
    status: { $ne: 'cancelled' },
    $or: [
      { paymentStatus: 'paid' },
      { paymentMethod: 'COD', status: 'delivered' },
    ],
  };
  if (Object.keys(extra).length === 0) return base;
  return { $and: [base, extra] };
};

// GET /api/analytics/revenue
exports.getRevenue = async (req, res, next) => {
  try {
    const { range = 'month' } = req.query;
    const now = new Date();
    let startDate;

    switch (range) {
      case 'day': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
      case 'all': startDate = new Date(2000, 0, 1); break;
      case 'month':
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
    }

    const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0);

    const agg = (extra) => Order.aggregate([
      { $match: revenueFilter(extra) },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const [totalRes, thisMonthRes, lastMonthRes] = await Promise.all([
      agg({ createdAt: { $gte: startDate } }),
      agg({ createdAt: { $gte: startOfMonth } }),
      agg({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const totalRevenue     = totalRes[0]?.total || 0;
    const thisMonthRevenue = thisMonthRes[0]?.total || 0;
    const lastMonthRevenue = lastMonthRes[0]?.total || 0;

    const growth = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : thisMonthRevenue > 0 ? 100 : 0;

    res.json({ totalRevenue, thisMonthRevenue, lastMonthRevenue, growth });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/sales-trend
exports.getSalesTrend = async (req, res, next) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const trend = await Order.aggregate([
      { $match: revenueFilter({ createdAt: { $gte: twelveMonthsAgo } }) },
      { $unwind: '$items' },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' },
            orderId: '$_id' // Group by order first to avoid double counting totalAmount
          },
          orderRevenue: { $first: '$totalAmount' },
          orderProfit: { $sum: { $multiply: ['$items.profit', '$items.quantity'] } },
        },
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          revenue: { $sum: '$orderRevenue' },
          profit: { $sum: '$orderProfit' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const found = trend.find(t => t._id.year === year && t._id.month === month);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year,
        revenue: found ? found.revenue : 0,
        profit: found ? found.profit : 0,
        orders: found ? found.orders : 0,
      });
    }

    res.json({ salesTrend: months });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/top-products
exports.getTopProducts = async (req, res, next) => {
  try {
    const topProducts = await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(10)
      .select('name price soldCount images');

    const productsWithRevenue = topProducts.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      soldCount: p.soldCount,
      revenue: p.price * p.soldCount,
      image: p.images[0]?.url || '',
    }));

    res.json({ topProducts: productsWithRevenue });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/user-stats
exports.getUserStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalUsers    = await User.countDocuments();
    const newThisMonth  = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    const segmentStats = await User.aggregate([
      { $group: { _id: '$segment', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const bySegment = {};
    segmentStats.forEach(s => { bySegment[s._id || 'Unclassified'] = s.count; });

    res.json({ totalUsers, newThisMonth, bySegment });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/order-stats
exports.getOrderStats = async (req, res, next) => {
  try {
    const statusStats = await Order.aggregate([
      { $match: revenueFilter() },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byStatus = {};
    statusStats.forEach(s => { byStatus[s._id] = s.count; });

    const avgOrderResult = await Order.aggregate([
      { $match: revenueFilter() },
      { $group: { _id: null, avgValue: { $avg: '$totalAmount' }, total: { $sum: 1 } } },
    ]);

    const avgOrderValue = avgOrderResult[0]?.avgValue
      ? Math.round(avgOrderResult[0].avgValue) : 0;
    const totalOrders = avgOrderResult[0]?.total || 0;

    res.json({ byStatus, avgOrderValue, totalOrders });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/summary
exports.getSummary = async (req, res, next) => {
  try {
    const { range = 'month' } = req.query;
    const now = new Date();
    let startDate;

    switch (range) {
      case 'day': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
      case 'all': startDate = new Date(2000, 0, 1); break;
      case 'month':
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
    }

    const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0);

    // Sales count — realized only (Paid or COD)
    const countOrders = (extra) => Order.countDocuments({ 
      ...revenueFilter(extra)
    });

    const [totalSales, thisMonthSales, lastMonthSales] = await Promise.all([
      countOrders({ createdAt: { $gte: startDate } }),
      countOrders({ createdAt: { $gte: startOfMonth } }),
      countOrders({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const salesGrowth = lastMonthSales > 0
      ? Math.round(((thisMonthSales - lastMonthSales) / lastMonthSales) * 100)
      : thisMonthSales > 0 ? 100 : 0;

    // Revenue — realized only
    const aggRevenue = (extra) => Order.aggregate([
      { $match: revenueFilter(extra) },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const [revAll, revThisMonth, revLastMonth] = await Promise.all([
      aggRevenue({ createdAt: { $gte: startDate } }),
      aggRevenue({ createdAt: { $gte: startOfMonth } }),
      aggRevenue({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const totalRevenue     = revAll[0]?.total || 0;
    const thisMonthRevenue = revThisMonth[0]?.total || 0;
    const lastMonthRevenue = revLastMonth[0]?.total || 0;

    const revenueGrowth = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : thisMonthRevenue > 0 ? 100 : 0;

    // Profit — Realized profit from items (non-cancelled orders)
    const aggProfit = (extra) => Order.aggregate([
      { $match: revenueFilter(extra) },
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: { $multiply: ['$items.profit', '$items.quantity'] } } } },
    ]);

    const [profitAll, profitThisMonth, profitLastMonth] = await Promise.all([
      aggProfit({ createdAt: { $gte: startDate } }),
      aggProfit({ createdAt: { $gte: startOfMonth } }),
      aggProfit({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const totalProfit     = profitAll[0]?.total || 0;
    const thisMonthProfit = profitThisMonth[0]?.total || 0;
    const lastMonthProfit = profitLastMonth[0]?.total || 0;

    const profitGrowth = lastMonthProfit > 0
      ? Math.round(((thisMonthProfit - lastMonthProfit) / lastMonthProfit) * 100)
      : thisMonthProfit > 0 ? 100 : 0;

    // Products sold — non-cancelled orders
    const aggSold = (extra) => Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, ...extra } },
      { $unwind: '$items' },
      { $group: { _id: null, totalSold: { $sum: '$items.quantity' } } },
    ]);

    const [soldAll, soldThisMonth, soldLastMonth] = await Promise.all([
      aggSold({ createdAt: { $gte: startDate } }),
      aggSold({ createdAt: { $gte: startOfMonth } }),
      aggSold({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const totalProductsSold     = soldAll[0]?.totalSold || 0;
    const thisMonthProductsSold = soldThisMonth[0]?.totalSold || 0;
    const lastMonthProductsSold = soldLastMonth[0]?.totalSold || 0;

    const soldGrowth = lastMonthProductsSold > 0
      ? Math.round(((thisMonthProductsSold - lastMonthProductsSold) / lastMonthProductsSold) * 100)
      : thisMonthProductsSold > 0 ? 100 : 0;

    // Pending COD — placed but not yet delivered
    const pendingCODResult = await Order.aggregate([
      { $match: { paymentMethod: 'COD', status: { $in: ['processing', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);
    const pendingCODRevenue = pendingCODResult[0]?.total || 0;
    const pendingCODCount   = pendingCODResult[0]?.count || 0;

    // Customer Segments
    const segmentStats = await User.aggregate([
      { $match: { role: 'customer' } },
      { $group: { _id: '$segment', count: { $sum: 1 } } },
    ]);
    const bySegment = {};
    segmentStats.forEach(s => { bySegment[s._id || 'New'] = s.count; });

    res.json({
      success: true,
      data: {
        totalSales,           thisMonthSales,           salesGrowth,
        totalRevenue,         thisMonthRevenue,         revenueGrowth,
        totalProfit,          thisMonthProfit,          profitGrowth,
        totalProductsSold,    thisMonthProductsSold,    soldGrowth,
        pendingCODRevenue,    pendingCODCount,
        bySegment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/predictions
exports.getPredictions = async (req, res, next) => {
  try {
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Product Demand Prediction (Velocity-based)
    const products = await Product.find({ isActive: true }).select('name price soldCount stock images category');
    
    // Simple Velocity Logic: (Sold / Total Age of product or just high soldCount)
    const demandPredictions = products
      .map(p => {
        const velocity = p.soldCount / 5; // Simplified velocity score
        const daysToStockout = velocity > 0 ? Math.round(p.stock / velocity) : 999;
        return {
          _id: p._id,
          name: p.name,
          stock: p.stock,
          predictedDemand: Math.round(velocity * 30), // Predicted next 30 days
          riskLevel: daysToStockout < 15 ? 'Critical' : daysToStockout < 30 ? 'High' : 'Stable',
          image: p.images?.[0]?.url || ''
        };
      })
      .sort((a, b) => b.predictedDemand - a.predictedDemand)
      .slice(0, 5);

    // 2. Churn Prediction (RFM based)
    const atRiskCustomers = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          lastOrder: { $max: '$orders.createdAt' },
          orderCount: { $size: '$orders' }
        }
      },
      { 
        $match: { 
          $or: [
            { lastOrder: { $lt: sixtyDaysAgo } },
            { orderCount: 0 }
          ]
        } 
      },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        demandPredictions,
        atRiskCustomers: atRiskCustomers.map(c => ({
          ...c,
          churnProbability: c.orderCount === 0 ? '90%' : '65%',
          status: 'At Risk'
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/inventory
exports.getLowStock = async (req, res, next) => {
  try {
    const lowStockProducts = await Product.find({ isActive: true, stock: { $lt: 10 } })
      .select('name stock price images category')
      .populate('category', 'name')
      .sort({ stock: 1 });

    res.json({ lowStockProducts });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/overview?range=day|month|year|all
exports.getOverview = async (req, res, next) => {
  try {
    const { range = 'month' } = req.query;
    const now = new Date();
    let startDate;
    let format = '%Y-%m-%d';
    let tickCount = 7;

    switch (range) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        format = '%H:00';
        tickCount = 24;
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        format = '%Y-%m';
        tickCount = 12;
        break;
      case 'all':
        startDate = new Date(2020, 0, 1);
        format = '%Y-%m';
        tickCount = 24; // Limit to last 2 years for visualization
        break;
      case 'month':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        format = '%Y-%m-%d';
        tickCount = 30;
        break;
    }

    const revResult = await Order.aggregate([
      { $match: revenueFilter({ createdAt: { $gte: startDate } }) },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revResult[0]?.total || 0;

    const totalOrders = await Order.countDocuments(revenueFilter({ createdAt: { $gte: startDate } }));
    const totalUsers  = await User.countDocuments({ createdAt: { $gte: startDate } });

    const topProducts = await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(5)
      .select('name price soldCount images');

    const rawTrend = await Order.aggregate([
      { $match: revenueFilter({ createdAt: { $gte: startDate } }) },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const salesTrend = [];
    if (range === 'day') {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const key = d.getHours().toString().padStart(2, '0') + ':00';
        const found = rawTrend.find(t => t._id === key);
        salesTrend.push({ date: key, revenue: found ? found.revenue : 0, orders: found ? found.count : 0 });
      }
    } else if (range === 'year' || range === 'all') {
      for (let i = tickCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0');
        const label = d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
        const found = rawTrend.find(t => t._id === key);
        salesTrend.push({ date: label, revenue: found ? found.revenue : 0, orders: found ? found.count : 0 });
      }
    } else {
      for (let i = tickCount - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        const found = rawTrend.find(t => t._id === key);
        salesTrend.push({ date: label, revenue: found ? found.revenue : 0, orders: found ? found.count : 0 });
      }
    }

    res.json({
      success: true,
      data: { totalRevenue, totalOrders, totalUsers, topProducts, salesTrend },
    });
  } catch (error) {
    next(error);
  }
};
