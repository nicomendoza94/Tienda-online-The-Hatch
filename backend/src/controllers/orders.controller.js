// Handles order visualization for the admin panel (read-only).
// Data access is delegated to the orders model.

const ordersModel = require('../models/orders.model');

// GET /orders - list all orders, most recent first
async function listOrders(req, res) {
  try {
    const orders = await ordersModel.findAll();

    res.render('orders/list', {
      title: 'Orders - Admin Panel',
      username: req.session.username,
      orders,
    });
  } catch (error) {
    console.error('❌ Error listing orders:', error.message);
    res.status(500).send('Error loading orders');
  }
}

module.exports = { listOrders };