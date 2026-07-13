// Model layer for the "products" collection.
// Encapsulates all direct database access related to products,
// so controllers don't talk to MongoDB directly.

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

// Inserts a new product document. Returns the MongoDB insert result.
async function create(productData) {
  return getDB().collection('products').insertOne(productData);
}

// Updates an existing product by id with the given fields.
async function updateById(id, updateData) {
  return getDB().collection('products').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
}

// Deletes a product by id.
async function deleteById(id) {
  return getDB().collection('products').deleteOne({ _id: new ObjectId(id) });
}

module.exports = { findAll, findById, create, updateById, deleteById };