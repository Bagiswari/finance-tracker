const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId, amount, type, description, date, autoCategorie = true } = req.body;

    console.log('📝 Creating transaction:', { userId, amount, type, description });

    // Validation
    if (!amount || !type || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, type, and date.'
      });
    }

    if (type !== 'expense' && type !== 'income') {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "expense" or "income".'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0.'
      });
    }

    let finalCategoryId = categoryId;
    let aiCategorized = false;

    // Auto-categorize if no category provided and description exists
    if (!categoryId && description && autoCategorie) {
      try {
        console.log('🤖 Auto-categorizing with AI...');
        const AIService = require('../services/aiService');
        const aiResult = await AIService.categorizeTransaction(description, amount, type);
        
        // Find matching category
        const category = await Category.findByName(aiResult.category);
        if (category) {
          finalCategoryId = category.id;
          aiCategorized = true;
          console.log('✅ Auto-categorized as:', aiResult.category);
        }
      } catch (aiError) {
        console.error('⚠️ AI categorization failed, using default:', aiError.message);
        // Fallback to default category
        const defaultCategory = await Category.findByName(type === 'expense' ? 'Others' : 'Salary');
        finalCategoryId = defaultCategory?.id || null;
      }
    }

    // Create transaction
    const transaction = await Transaction.create(userId, {
      categoryId: finalCategoryId,
      amount,
      type,
      description: description || '',
      date,
      aiCategorized
    });

    console.log('✅ Transaction created:', transaction.id);

    // Get the full transaction with category details
    const fullTransaction = await Transaction.findById(transaction.id, userId);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: { 
        transaction: fullTransaction,
        aiCategorized
      }
    });
  } catch (error) {
    console.error('❌ Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating transaction.'
    });
  }
};

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type, categoryId, limit } = req.query;

    console.log('📊 Fetching transactions for user:', userId);

    const filters = {
      startDate,
      endDate,
      type,
      categoryId,
      limit: limit ? parseInt(limit) : null
    };

    const transactions = await Transaction.findByUserId(userId, filters);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        count: transactions.length
      }
    });
  } catch (error) {
    console.error('❌ Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transactions.'
    });
  }
};

// Get single transaction
const getTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const transaction = await Transaction.findById(id, userId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('❌ Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transaction.'
    });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { categoryId, amount, type, description, date } = req.body;

    console.log('✏️ Updating transaction:', id);

    const transaction = await Transaction.update(id, userId, {
      categoryId,
      amount,
      type,
      description,
      date
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    console.log('✅ Transaction updated');

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: { transaction }
    });
  } catch (error) {
    console.error('❌ Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating transaction.'
    });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log('🗑️ Deleting transaction:', id);

    const transaction = await Transaction.delete(id, userId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    console.log('✅ Transaction deleted');

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    console.error('❌ Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting transaction.'
    });
  }
};

// Get monthly summary
const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year.'
      });
    }

    console.log('📈 Fetching monthly summary:', { month, year });

    const summary = await Transaction.getMonthlySummary(
      userId,
      parseInt(month),
      parseInt(year)
    );

    // Calculate totals
    const totalExpense = summary
      .filter(s => s.type === 'expense')
      .reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    const totalIncome = summary
      .filter(s => s.type === 'income')
      .reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    res.status(200).json({
      success: true,
      data: {
        summary,
        totals: {
          expense: totalExpense,
          income: totalIncome,
          balance: totalIncome - totalExpense
        }
      }
    });
  } catch (error) {
    console.error('❌ Get monthly summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching summary.'
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate.'
      });
    }

    console.log('📊 Fetching analytics:', { startDate, endDate });

    // Get all transactions in range
    const transactions = await Transaction.findByUserId(userId, { startDate, endDate });

    // Calculate totals by type
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Group by category
    const byCategory = {};
    transactions.forEach(t => {
      const cat = t.category_name || 'Uncategorized';
      if (!byCategory[cat]) {
        byCategory[cat] = { name: cat, icon: t.category_icon, total: 0, count: 0, type: t.type };
      }
      byCategory[cat].total += parseFloat(t.amount);
      byCategory[cat].count += 1;
    });

    // Group by date for trend
    const byDate = {};
    transactions.forEach(t => {
      const date = t.date.toISOString().split('T')[0];
      if (!byDate[date]) {
        byDate[date] = { date, expense: 0, income: 0 };
      }
      if (t.type === 'expense') {
        byDate[date].expense += parseFloat(t.amount);
      } else {
        byDate[date].income += parseFloat(t.amount);
      }
    });

    const trend = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalExpense,
          totalIncome,
          balance: totalIncome - totalExpense,
          transactionCount: transactions.length
        },
        byCategory: Object.values(byCategory).sort((a, b) => b.total - a.total),
        trend
      }
    });
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics.'
    });
  }
};

// Export the new function
module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getAnalytics  // Add this
};