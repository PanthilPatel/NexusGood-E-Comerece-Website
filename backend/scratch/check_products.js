const mongoose = require('mongoose');
require('dotenv').config();

const checkProducts = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing from .env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require('../src/models/Product');
    const count = await Product.countDocuments();
    console.log(`Total Products: ${count}`);
    const products = await Product.find().limit(5);
    console.log('Sample Products:', JSON.stringify(products, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkProducts();
