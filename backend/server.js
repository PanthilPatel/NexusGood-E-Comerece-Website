require('dotenv').config(); 
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const { authLimiter, apiLimiter } = require('./src/middleware/rateLimiter');
const http = require('http');
const { initSocket } = require('./src/config/socket');

// Route imports
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const categoryRoutes = require('./src/routes/categories');
const cartRoutes = require('./src/routes/cart');
const wishlistRoutes = require('./src/routes/wishlist');
const orderRoutes = require('./src/routes/orders');
const paymentRoutes = require('./src/routes/payments');
const reviewRoutes = require('./src/routes/reviews');
const couponRoutes = require('./src/routes/coupons');
const analyticsRoutes = require('./src/routes/analytics');
const recommendationRoutes = require('./src/routes/recommendations');
const userRoutes = require('./src/routes/users');
const returnRoutes = require('./src/routes/returns');
const walletRoutes = require('./src/routes/wallet');
const aiRoutes = require('./src/routes/ai');
const supportRoutes = require('./src/routes/support');
const settingsRoutes = require('./src/routes/settings');

const app = express();

// Connect to MongoDB
connectDB().then(async () => {
  const User = require('./src/models/User');
  const adminEmail = 'admin@nexusgood.com';
  const adminPass = 'nexgd@1290';
  
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    await User.create({
      name: 'NexusGood Admin',
      email: adminEmail,
      password: adminPass,
      role: 'admin'
    });
    console.log(`🚀 Created initial admin account: ${adminEmail} / ${adminPass}`);
  } else {
    admin.password = adminPass;
    admin.role = 'admin';
    await admin.save();
    console.log(`✅ Admin account updated and password reset: ${adminEmail} / ${adminPass}`);
  }
});

// Middleware
app.use(compression());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Strip $ and . from request bodies to prevent NoSQL injection
app.use(mongoSanitize());

// Apply general rate limiter to all API routes
app.use('/api', apiLimiter);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    const origin = res.req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    }
  }
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server, allowedOrigins);

server.listen(PORT, () => {
  console.log(`🚀 NexusGood API running on port ${PORT}`);
});

// ── CRON JOBS ────────────────────────────────────────────────────────────────
const cron = require('node-cron');
const Cart = require('./src/models/Cart');
const User = require('./src/models/User');
const Order = require('./src/models/Order');
const { sendAbandonedCartEmail } = require('./src/services/emailService');

// Abandoned cart recovery — runs every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running abandoned cart recovery...');
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago
    const carts = await Cart.find({
      'items.0': { $exists: true },
      lastModifiedAt: { $lt: cutoff },
      $or: [{ recoverySentAt: null }, { recoverySentAt: { $lt: cutoff } }],
    }).populate({ path: 'items.product', select: 'name price images' });

    for (const cart of carts) {
      const user = await User.findById(cart.user).select('name email');
      if (!user) continue;

      // Check user hasn't ordered in last 24h
      const recentOrder = await Order.findOne({
        user: cart.user,
        createdAt: { $gte: cutoff },
      });
      if (recentOrder) continue;

      await sendAbandonedCartEmail(user, cart.items);
      cart.recoverySentAt = new Date();
      await cart.save();
    }
    console.log(`✅ Abandoned cart emails sent to ${carts.length} users.`);
  } catch (err) {
    console.error('Abandoned cart cron error:', err.message);
  }
});

// RFM Customer Segmentation — runs every night at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Running RFM segmentation...');
  try {
    const users = await User.find({ role: 'customer' }).select('_id segment');
    const now = Date.now();

    for (const user of users) {
      const orders = await Order.find({
        user: user._id,
        status: { $ne: 'cancelled' },
      }).select('totalAmount createdAt').lean();

      if (orders.length === 0) continue;

      const lastOrder = orders.reduce((a, b) => a.createdAt > b.createdAt ? a : b);
      const recencyDays = (now - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const frequency = orders.length;
      const monetary = orders.reduce((s, o) => s + o.totalAmount, 0);

      let segment = 'New';
      if (frequency === 1) {
        segment = 'New';
      } else if (recencyDays > 120) {
        segment = 'Lost';
      } else if (recencyDays > 60 && ['Champion', 'Loyal'].includes(user.segment)) {
        segment = 'AtRisk';
      } else if (recencyDays < 30 && frequency >= 5 && monetary >= 5000) {
        segment = 'Champion';
      } else if (recencyDays < 60 && frequency >= 3) {
        segment = 'Loyal';
      } else if (recencyDays < 14) {
        segment = 'Recent';
      }

      if (segment !== user.segment) {
        await User.findByIdAndUpdate(user._id, { segment });
      }

      // Update Loyalty Tier based on monetary value
      let loyaltyTier = 'Bronze';
      if (monetary >= 50000) loyaltyTier = 'Platinum';
      else if (monetary >= 20000) loyaltyTier = 'Gold';
      else if (monetary >= 5000) loyaltyTier = 'Silver';

      if (loyaltyTier !== user.loyaltyTier) {
        await User.findByIdAndUpdate(user._id, { loyaltyTier });
      }
    }
    console.log(`✅ RFM segmentation complete for ${users.length} users.`);
  } catch (err) {
    console.error('RFM cron error:', err.message);
  }
});

module.exports = app;
