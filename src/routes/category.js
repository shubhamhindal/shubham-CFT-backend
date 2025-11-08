const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createCategory, listCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.post('/category', auth, createCategory);
router.get('/categories', auth, listCategories);
router.put('/category/:categoryId', auth, updateCategory);
router.delete('/category/:categoryId', auth, deleteCategory);

module.exports = router;