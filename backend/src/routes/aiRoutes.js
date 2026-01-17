const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const {
  categorizeSingle,
  getInsights,
  getBudgetSuggestions
} = require('../controllers/aiController');

// All routes require authentication
router.use(authenticate);

router.post('/categorize', categorizeSingle);
router.get('/insights', getInsights);
router.get('/budget-suggestions', getBudgetSuggestions);

module.exports = router;