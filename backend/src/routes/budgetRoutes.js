const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const {
  setBudget,
  getBudgets,
  getBudgetAlerts,
  deleteBudget
} = require('../controllers/budgetController');

// All routes require authentication
router.use(authenticate);

router.post('/', setBudget);
router.get('/', getBudgets);
router.get('/alerts', getBudgetAlerts);
router.delete('/:id', deleteBudget);

module.exports = router;