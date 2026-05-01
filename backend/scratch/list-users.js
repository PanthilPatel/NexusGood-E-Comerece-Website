require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'name email role');
    console.log('--- User List ---');
    users.forEach(u => {
      console.log(`${u.role.toUpperCase()}: ${u.email} (${u.name})`);
    });
    console.log('-----------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
listUsers();
