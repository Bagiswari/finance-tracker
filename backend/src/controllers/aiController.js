const AIService = require('../services/aiService');
const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');

// Auto-categorize a transaction
const categorizeSingle = async (req, res) => {
  try {
    const { description, amount, type } = req.body;

    if (!description || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide description and type.'
      });
    }

    const result = await AIService.categorizeTransaction(
      description,
      amount || 0,
      type
    );

    // Find matching category in database
    const category = await Category.findByName(result.category);

    res.status(200).json({
      success: true,
      data: {
        suggestedCategory: result.category,
        categoryId: category?.id || null,
        confidence: result.confidence
      }
    });
  } catch (error) {
    console.error('❌ Categorize error:', error);
    res.status(500).json({
      success: false,
      message: 'AI categorization failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get spending insights
const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year.'
      });
    }

    // Get transactions and summary
    const transactions = await Transaction.findByUserId(userId, {
      startDate: `${year}-${month.padStart(2, '0')}-01`,
      endDate: `${year}-${month.padStart(2, '0')}-31`
    });

    const summary = await Transaction.getMonthlySummary(
      userId,
      parseInt(month),
      parseInt(year)
    );

    const totalExpense = summary
      .filter(s => s.type === 'expense')
      .reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    const totalIncome = summary
      .filter(s => s.type === 'income')
      .reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    const topCategories = summary
      .filter(s => s.type === 'expense')
      .sort((a, b) => parseFloat(b.total_amount) - parseFloat(a.total_amount))
      .slice(0, 5)
      .map(s => ({ name: s.category_name, amount: s.total_amount }));

    const monthlyData = {
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
      topCategories
    };

    const insights = await AIService.generateInsights(transactions, monthlyData);

    res.status(200).json({
      success: true,
      data: {
        insights,
        summary: monthlyData
      }
    });
  } catch (error) {
    console.error('❌ Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights.'
    });
  }
};

// Get budget suggestions
const getBudgetSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year.'
      });
    }

    const summary = await Transaction.getMonthlySummary(
      userId,
      parseInt(month),
      parseInt(year)
    );

    const totalExpense = summary
      .filter(s => s.type === 'expense')
      .reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    const totalIncome = summary
      .filter(s => s.type === 'income')
      .reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    const categories = summary
      .filter(s => s.type === 'expense')
      .map(s => ({
        name: s.category_name,
        amount: s.total_amount
      }));

    const monthlyData = {
      totalExpense,
      totalIncome,
      categories
    };

    const suggestions = await AIService.suggestBudget(monthlyData);

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        currentSpending: monthlyData
      }
    });
  } catch (error) {
    console.error('❌ Budget suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate budget suggestions.'
    });
  }
};

module.exports = {
  categorizeSingle,
  getInsights,
  getBudgetSuggestions
};