const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-create admin if no users exist
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'NexusGood Admin',
        email: 'admin@nexusgood.com',
        password: 'nexgd@1290',
        role: 'admin'
      });
      console.log('🚀 Created initial admin account: admin@nexusgood.com / nexgd@1290');
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
