// Handles order visualization for the admin panel.
// Orders are only created from the public store (frontend); here we only read them.

const { getDB } = require('../config/db');

// GET /orders - list all orders, most recent first
async function listOrders(req, res) {
  try {
    const db = getDB();
    const orders = await db.collection('orders')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

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