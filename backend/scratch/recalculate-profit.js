const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Order = require('../src/models/Order');

const recalculateProfit = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Database URI not found in environment variables (tried MONGO_URI and MONGODB_URI).');
    }

    await mongoose.connect(uri);
    console.log('🚀 Connected to database for profit recalibration...');

    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    let totalUpdated = 0;

    for (const order of orders) {
      let orderUpdated = false;
      for (const item of order.items) {
        // If profit is 0 or missing, set a healthy 20% fallback
        if (!item.profit || item.profit === 0) {
          item.profit = Math.round(item.price * 0.20);
          orderUpdated = true;
        }
      }

      if (orderUpdated) {
        await order.save();
        totalUpdated++;
      }
    }

    console.log(`✅ Profit recalibration complete. ${totalUpdated} orders updated.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Recalibration failed:', err.message);
    process.exit(1);
  }
};

recalculateProfit();
