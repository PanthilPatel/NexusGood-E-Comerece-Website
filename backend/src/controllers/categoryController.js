const Category = require('../models/Category');

// GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories — admin create
exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }
    const category = await Category.create({ name, icon, description });
    res.status(201).json({ success: true, message: 'Category created.', data: category });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id — admin update
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, icon, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    if (name) category.name = name;
    if (icon !== undefined) category.icon = icon;
    if (description !== undefined) category.description = description;
    await category.save();
    res.json({ success: true, message: 'Category updated.', data: category });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id — admin delete
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};
