require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@nexusgood.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists. Updating role and resetting password...');
      existingAdmin.role = 'admin';
      existingAdmin.password = 'admin@123';
      await existingAdmin.save();
    } else {
      console.log('Creating new admin...');
      await User.create({
        name: 'NexusGood Admin',
        email: adminEmail,
        password: 'admin@123', // User should change this
        role: 'admin',
        segment: 'Champion'
      });
    }

    console.log('Admin account ready: admin@nexusgood.com / admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
