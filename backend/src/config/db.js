const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-create specific admin if not exists
    const adminExists = await User.findOne({ email: 'admin@nexusgood.com' });
    if (!adminExists) {
      await User.create({
        name: 'NexusGood Admin',
        email: 'admin@nexusgood.com',
        password: 'nexgd@1290',
        role: 'admin'
      });
      console.log('🚀 Created initial admin account: admin@nexusgood.com / nexgd@1290');
    } else {
      console.log('✅ Admin account already exists: admin@nexusgood.com');
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
