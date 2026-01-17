const Budget = require('../models/budgetModel');

// Set or update budget
const setBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📦 Received body:', req.body);
    console.log('📦 Body type:', typeof req.body);
    
    // Check if body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is empty. Make sure Content-Type is application/json and there is a blank line before the JSON body.'
      });
    }

    const { categoryId, amount, month, year } = req.body;

    if (!categoryId || !amount || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide categoryId, amount, month, and year.',
        received: { categoryId, amount, month, year }
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be greater than 0.'
      });
    }

    console.log('💰 Setting budget:', { categoryId, amount, month, year });

    const budget = await Budget.upsert(userId, categoryId, amount, month, year);

    res.status(201).json({
      success: true,
      message: 'Budget set successfully.',
      data: { budget }
    });
  } catch (error) {
    console.error('❌ Set budget error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error setting budget.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get budgets for a month
const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year.'
      });
    }

    const budgets = await Budget.findByMonth(userId, parseInt(month), parseInt(year));

    res.status(200).json({
      success: true,
      data: { budgets }
    });
  } catch (error) {
    console.error('❌ Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budgets.'
    });
  }
};

// Get budget alerts
const getBudgetAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year.'
      });
    }

    const alerts = await Budget.getAlerts(userId, parseInt(month), parseInt(year));

    res.status(200).json({
      success: true,
      data: {
        alerts,
        hasAlerts: alerts.length > 0,
        count: alerts.length
      }
    });
  } catch (error) {
    console.error('❌ Get budget alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching alerts.'
    });
  }
};

// Delete budget
const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const budget = await Budget.delete(id, userId);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.'
    });
  } catch (error) {
    console.error('❌ Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting budget.'
    });
  }
};

module.exports = {
  setBudget,
  getBudgets,
  getBudgetAlerts,
  deleteBudget
};