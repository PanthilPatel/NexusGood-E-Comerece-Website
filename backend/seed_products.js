require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

const productsToSeed = [
  {
    name: "Aura Mirror Display",
    description: "A smart holographic mirror that synchronizes with your digital life. 4K OLED panel behind semi-reflective glass.",
    price: 85000,
    comparePrice: 95000,
    stock: 15,
    categoryName: "Home & Sanctuary",
    images: [{ url: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800", publicId: "aura_mirror" }],
    isFeatured: true,
    tags: ["smart home", "luxury", "holographic"]
  },
  {
    name: "Quantum Keyboard TKL",
    description: "Mechanical precision meets neural aesthetics. Opto-magnetic switches with zero-latency response.",
    price: 18500,
    comparePrice: 22000,
    stock: 50,
    categoryName: "Electronics & Gadgets",
    images: [{ url: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800", publicId: "quantum_kb" }],
    isFeatured: true,
    tags: ["gaming", "mechanical", "precision"]
  },
  {
    name: "Nebula Windbreaker",
    description: "Nanotech fabric that adapts to ambient temperature. Iridescent finish that changes with light.",
    price: 12000,
    comparePrice: 15000,
    stock: 30,
    categoryName: "Apparel & Lifestyle",
    images: [{ url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800", publicId: "nebula_jacket" }],
    isFeatured: true,
    tags: ["fashion", "techwear", "iridescent"]
  },
  {
    name: "Cipher Key 2FA",
    description: "Hardware encryption module for the modern digital nomad. Biometric synchronization and cold storage.",
    price: 8500,
    comparePrice: 10000,
    stock: 100,
    categoryName: "Electronics & Gadgets",
    images: [{ url: "https://images.unsplash.com/photo-1633265485732-d73c04582c41?auto=format&fit=crop&q=80&w=800", publicId: "cipher_key" }],
    isFeatured: false,
    tags: ["security", "crypto", "privacy"]
  },
  {
    name: "Zenith Standing Desk",
    description: "Solid walnut top with integrated wireless charging and touch-sensitive height memory.",
    price: 125000,
    comparePrice: 140000,
    stock: 10,
    categoryName: "Home & Sanctuary",
    images: [{ url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800", publicId: "zenith_desk" }],
    isFeatured: true,
    tags: ["workspace", "minimalist", "luxury"]
  },
  {
    name: "Nova Wireless Earbuds",
    description: "Active noise cancellation with 360-degree spatial audio synchronization.",
    price: 24500,
    comparePrice: 28000,
    stock: 45,
    categoryName: "Electronics & Gadgets",
    images: [{ url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800", publicId: "nova_buds" }],
    isFeatured: true,
    tags: ["audio", "wireless", "anc"]
  },
  {
    name: "Titanium Card Wallet",
    description: "Grade-5 titanium plate with RFID blocking and minimalist spring-loaded card ejection.",
    price: 6500,
    comparePrice: 8000,
    stock: 75,
    categoryName: "Apparel & Lifestyle",
    images: [{ url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800", publicId: "titanium_wallet" }],
    isFeatured: false,
    tags: ["minimalist", "edc", "titanium"]
  },
  {
    name: "Prism 4K Monitor",
    description: "Ultra-thin bezel with 100% Adobe RGB coverage. Designed for visionary creators.",
    price: 68000,
    comparePrice: 75000,
    stock: 20,
    categoryName: "Electronics & Gadgets",
    images: [{ url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800", publicId: "prism_monitor" }],
    isFeatured: true,
    tags: ["workspace", "4k", "creative"]
  },
  {
    name: "Vortex Backpack",
    description: "Waterproof ballistic nylon with integrated solar charging panel and hidden anti-theft compartments.",
    price: 15500,
    comparePrice: 18000,
    stock: 40,
    categoryName: "Apparel & Lifestyle",
    images: [{ url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800", publicId: "vortex_bag" }],
    isFeatured: true,
    tags: ["travel", "techwear", "solar"]
  },
  {
    name: "Aether Smart Lamp",
    description: "Fluid lighting with app-controlled atmospheric presets. Mimics natural circadian rhythms.",
    price: 12500,
    comparePrice: 14000,
    stock: 60,
    categoryName: "Home & Sanctuary",
    images: [{ url: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800", publicId: "aether_lamp" }],
    isFeatured: false,
    tags: ["lighting", "smart home", "atmosphere"]
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const p of productsToSeed) {
      const category = await Category.findOne({ name: p.categoryName });
      if (!category) {
        console.warn(`Category not found: ${p.categoryName}. Skipping ${p.name}`);
        continue;
      }

      const existing = await Product.findOne({ name: p.name });
      if (existing) {
        console.log(`Product already exists: ${p.name}. Updating...`);
        Object.assign(existing, { ...p, category: category._id });
        await existing.save();
      } else {
        await Product.create({ ...p, category: category._id });
        console.log(`Created product: ${p.name}`);
      }
    }

    console.log('Product seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
