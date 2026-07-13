// Model layer for the "orders" collection.
// This is where orders are actually created, from the public store.

const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// Creates a new order document. Returns the MongoDB insert result.
async function create(orderData) {
  return getDB().collection('orders').insertOne(orderData);
}

// Finds an order by its id (used for the confirmation page)
async function findById(id) {
  return getDB().collection('orders').findOne({ _id: new ObjectId(id) });
}

module.exports = { create, findById };