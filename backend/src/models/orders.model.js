// Model layer for the "orders" collection.
// The admin panel only reads orders (created from the store, not here).

const { getDB } = require('../config/db');

// Returns all orders, most recent first
async function findAll() {
  return getDB().collection('orders')
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}

module.exports = { findAll };