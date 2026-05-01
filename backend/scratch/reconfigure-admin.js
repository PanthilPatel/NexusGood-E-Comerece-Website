require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function reconfigure() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Remove admin role from 23e02ml134@ppsu.ac.in
  const user1 = await User.findOne({ email: '23e02ml134@ppsu.ac.in' });
  if (user1) {
    user1.role = 'customer';
    await user1.save();
    console.log('User 23e02ml134@ppsu.ac.in demoted to customer.');
  }

  // 2. Change admin@shopelite.com to admin@nexusgood.com and update password
  const admin = await User.findOne({ email: 'admin@shopelite.com' });
  if (admin) {
    admin.email = 'admin@nexusgood.com';
    admin.password = 'admin@123';
    admin.role = 'admin';
    await admin.save();
    console.log('Admin account updated: admin@nexusgood.com / admin@123');
  } else {
    // If not found, create new
    await User.create({
      name: 'NexusGood Root',
      email: 'admin@nexusgood.com',
      password: 'admin@123',
      role: 'admin'
    });
    console.log('New Admin account created: admin@nexusgood.com / admin@123');
  }

  process.exit(0);
}

reconfigure();
