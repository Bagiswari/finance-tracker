const Category = require('../models/categoryModel');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📂 Fetching categories for user:', userId);

    const categories = await Category.findAll(userId);

    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories.'
    });
  }
};

// Create custom category
const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and type.'
      });
    }

    if (type !== 'expense' && type !== 'income') {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "expense" or "income".'
      });
    }

    console.log('✨ Creating custom category:', name);

    const category = await Category.create(userId, name, type, icon);

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: { category }
    });
  } catch (error) {
    console.error('❌ Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating category.'
    });
  }
};

module.exports = { getCategories, createCategory };