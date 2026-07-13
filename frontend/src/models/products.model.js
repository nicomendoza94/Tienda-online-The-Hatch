// Model layer for the "products" collection (read-only from the store's perspective).
// The store never creates, updates, or deletes products — that's the admin's job.

const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// Returns all products, most recently created first
async function findAll() {
  return getDB().collection('products')
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}

// Returns a single product by its id, or null if not found
async function findById(id) {
  return getDB().collection('products').findOne({ _id: new ObjectId(id) });
}

// Decreases a product's stock by a given quantity (used after an order is placed)
async function decreaseStock(id, quantity) {
  return getDB().collection('products').updateOne(
    { _id: new ObjectId(id) },
    { $inc: { stock: -quantity } }
  );
}

module.exports = { findAll, findById, decreaseStock };