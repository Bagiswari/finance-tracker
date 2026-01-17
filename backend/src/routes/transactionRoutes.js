const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getAnalytics
} = require('../controllers/transactionController');

// All routes require authentication
router.use(authenticate);

// Transaction CRUD
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/summary', getMonthlySummary);
router.get('/analytics', getAnalytics);
router.get('/:id', getTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;