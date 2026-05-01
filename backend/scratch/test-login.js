require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const email = '23e02ml134@ppsu.ac.in';
  const pass = 'pass123';
  
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log('User NOT found in DB search');
    process.exit(1);
  }
  
  const isMatch = await user.comparePassword(pass);
  console.log(`Email: ${email}`);
  console.log(`Password Match: ${isMatch}`);
  console.log(`Role: ${user.role}`);
  
  process.exit(0);
}

test();
