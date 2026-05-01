require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const categories = [
      { name: 'Electronics & Gadgets', description: 'Cutting edge technology and hardware' },
      { name: 'Apparel & Lifestyle', description: 'Premium clothing and accessories' },
      { name: 'Home & Sanctuary', description: 'Decor and essentials for your living space' },
      { name: 'Digital Artifacts', description: 'Software, assets and digital goods' }
    ];

    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedCategories();
