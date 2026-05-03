const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// GET /api/products — paginated, filterable, searchable
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      sort = '-createdAt',
      tags,
    } = req.query;

    const query = { isActive: true };

    // Search by name/tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by minimum rating
    if (minRating) {
      query.avgRating = { $gte: Number(minRating) };
    }

    // Filter by tags
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price_asc':
        sortObj = { price: 1 };
        break;
      case 'price_desc':
        sortObj = { price: -1 };
        break;
      case 'rating':
        sortObj = { avgRating: -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'popular':
        sortObj = { soldCount: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/featured — Get the single curated product for home page
exports.getFeaturedProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ isFeatured: true, isActive: true })
      .populate('category', 'name slug');
    
    // Fallback to newest if none featured
    if (!product) {
      const fallback = await Product.findOne({ isActive: true })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 });
      return res.json({ success: true, data: fallback });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/flash-sales — Active deals only
exports.getFlashSales = async (req, res, next) => {
  try {
    const products = await Product.find({
      isActive: true,
      isFlashSale: true,
      flashSaleEnd: { $gt: new Date() },
      stock: { $gt: 0 },
    })
      .populate('category', 'name slug')
      .sort({ flashSaleEnd: 1 })
      .limit(10);

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// POST /api/products — admin create
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, comparePrice, stock, category, tags, shippingFee, gst, colors } = req.body;

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push({ url: `${baseUrl}/uploads/products/${file.filename}`, publicId: file.filename });
      }
    }

    const parsedTags = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [];

    // Parse colors — sent as JSON string from FormData
    let parsedColors = [];
    if (colors) {
      try { parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors; } catch {}
    }

    const product = await Product.create({
      name, description,
      price: Number(price),
      comparePrice: Number(comparePrice) || 0,
      stock: Number(stock),
      category, images,
      tags: parsedTags,
      shippingFee: Number(shippingFee) || 0,
      gst: Number(gst) || 0,
      colors: parsedColors,
      isFlashSale: req.body.isFlashSale === 'true' || req.body.isFlashSale === true,
      flashSalePrice: Number(req.body.flashSalePrice) || undefined,
      flashSaleEnd: req.body.flashSaleEnd || undefined,
      profitType: req.body.profitType || 'percentage',
      profitValue: Number(req.body.profitValue) || 0,
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
    });

    // If this one is featured, un-feature all others
    if (product.isFeatured) {
      await Product.updateMany({ _id: { $ne: product._id } }, { isFeatured: false });
    }

    const populated = await product.populate('category', 'name slug');
    res.status(201).json({ success: true, data: populated, message: 'Product created successfully.' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id — admin update
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, comparePrice, stock, category, tags, isActive, removeImages, shippingFee, gst, colors } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (comparePrice !== undefined) product.comparePrice = Number(comparePrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (category) product.category = category;
    if (isActive !== undefined) product.isActive = isActive;
    if (shippingFee !== undefined) product.shippingFee = Number(shippingFee);
    if (gst !== undefined) product.gst = Number(gst);
    if (tags) product.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    if (colors) {
      try { product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors; } catch {}
    }

    if (req.body.isFlashSale !== undefined) product.isFlashSale = req.body.isFlashSale === 'true' || req.body.isFlashSale === true;
    if (req.body.flashSalePrice !== undefined) product.flashSalePrice = Number(req.body.flashSalePrice);
    if (req.body.flashSaleEnd !== undefined) product.flashSaleEnd = req.body.flashSaleEnd;

    if (req.body.profitType) product.profitType = req.body.profitType;
    if (req.body.profitValue !== undefined) product.profitValue = Number(req.body.profitValue);

    if (req.body.isFeatured !== undefined) {
      const isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
      product.isFeatured = isFeatured;
      if (isFeatured) {
        // Un-feature all others
        await Product.updateMany({ _id: { $ne: product._id } }, { isFeatured: false });
      }
    }

    if (removeImages && removeImages.length > 0) {
      const imagesToRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
      for (const publicId of imagesToRemove) {
        if (!publicId || typeof publicId !== 'string') continue;
        const filePath = path.join(__dirname, '../../uploads/products', publicId);
        try {
          if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error(`Failed to remove image: ${publicId}`, err);
        }
        product.images = product.images.filter(img => img.publicId !== publicId);
      }
    }

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        product.images.push({ url: `${baseUrl}/uploads/products/${file.filename}`, publicId: file.filename });
      }
    }

    await product.save();
    const populated = await product.populate('category', 'name slug');
    res.json({ message: 'Product updated successfully.', product: populated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id — admin soft delete
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/related/:id — 4 related products from same category
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate('category', 'name slug')
      .sort({ avgRating: -1 })
      .limit(4);

    res.json({ products: related });
  } catch (error) {
    next(error);
  }
};

// POST /api/products/bulk-import — Admin bulk upload
exports.bulkImport = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: 'No CSV file uploaded.' });

  const csv = require('csv-parser');
  const results = [];
  const errors = [];
  let count = 0;

  try {
    const stream = fs.createReadStream(req.file.path).pipe(csv());

    for await (const row of stream) {
      try {
        // Basic validation
        if (!row.name || !row.price || !row.category) {
          errors.push(`Row ${count + 1}: Missing name, price or category ID`);
          continue;
        }

        await Product.create({
          name: row.name,
          description: row.description || 'No description provided.',
          price: Number(row.price),
          comparePrice: Number(row.comparePrice) || 0,
          stock: Number(row.stock) || 0,
          category: row.category,
          tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
          profitType: row.profit_type || 'percentage',
          profitValue: Number(row.profit_value) || 0,
          isActive: true
        });
        count++;
      } catch (err) {
        errors.push(`Row ${count + 1} (${row.name}): ${err.message}`);
      }
    }

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true, 
      message: `Imported ${count} products.`, 
      count,
      errors 
    });
  } catch (error) {
    next(error);
  }
};

