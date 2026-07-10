// Product routes - all protected by requireAuth (only Paula can manage products)

const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const {
  listProducts,
  showNewForm,
  createProduct,
  showEditForm,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controller');

router.get('/', listProducts);
router.get('/new', showNewForm);
router.post('/', upload.single('image'), createProduct);
router.get('/:id/edit', showEditForm);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;