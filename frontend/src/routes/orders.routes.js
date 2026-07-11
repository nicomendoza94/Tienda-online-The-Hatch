const express = require('express');
const router = express.Router();
const { showCheckoutForm, createOrder, showConfirmation } = require('../controllers/orders.controller');

router.get('/checkout/:productId', showCheckoutForm);
router.post('/orders', createOrder);
router.get('/orders/:id/confirmation', showConfirmation);

module.exports = router;