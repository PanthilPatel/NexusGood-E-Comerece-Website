const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS (bypasses ISP blocking)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 10;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      family: 4,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying connection... (${retryCount + 1}/${MAX_RETRIES})`);
      setTimeout(() => connectDB(retryCount + 1), RETRY_INTERVAL);
    } else {
      console.error('💀 Max retries reached. Running without database.');
    }
  }
};

module.exports = connectDB;
