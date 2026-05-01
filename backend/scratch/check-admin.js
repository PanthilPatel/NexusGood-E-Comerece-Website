require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: '23e02ml134@ppsu.ac.in' });
  if (user) {
    console.log(`User: ${user.email}, Role: ${user.role}`);
    // If not admin, make it admin
    if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      console.log('Role upgraded to admin.');
    }
  } else {
    console.log('User not found.');
  }
  process.exit(0);
}

check();
