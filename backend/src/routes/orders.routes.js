// Order routes - protected by requireAuth, read-only for the admin panel.

const express = require('express');
const router = express.Router();
const { listOrders } = require('../controllers/orders.controller');

router.get('/', listOrders);

module.exports = router;