require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = '23e02ml134@ppsu.ac.in';
    const user = await User.findOne({ email });
    
    if (user) {
      user.password = 'pass123';
      await user.save();
      console.log(`✅ Password reset for ${email} to: pass123`);
    } else {
      console.log('❌ User not found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
resetPassword();
