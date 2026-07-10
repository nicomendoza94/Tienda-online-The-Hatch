const express = require('express');
const router = express.Router();
const { listProducts, showProduct } = require('../controllers/shop.controller');

router.get('/', listProducts);
router.get('/products/:id', showProduct);

module.exports = router;