const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { getCategories, createCategory } = require('../controllers/categoryController');

// All routes require authentication
router.use(authenticate);

router.get('/', getCategories);
router.post('/', createCategory);

module.exports = router;