require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const emails = ['admin@shopelite.com', '23e02ml134@ppsu.ac.in'];
  const testPass = 'admin123';
  const testPass2 = 'pass123';

  for (const email of emails) {
    const user = await User.findOne({ email }).select('+password');
    if (user) {
      const match1 = await bcrypt.compare(testPass, user.password);
      const match2 = await bcrypt.compare(testPass2, user.password);
      console.log(`Email: ${email}`);
      console.log(`- Matches 'admin123': ${match1}`);
      console.log(`- Matches 'pass123': ${match2}`);
      console.log(`- Current Role: ${user.role}`);
    } else {
      console.log(`Email: ${email} NOT FOUND`);
    }
  }
  
  process.exit(0);
}

verify();
