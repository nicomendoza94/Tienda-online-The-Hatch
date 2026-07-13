// Model layer for the "admins" collection.
// Used for authentication (login) only.

const { getDB } = require('../config/db');

// Finds an admin user by username
async function findByUsername(username) {
  return getDB().collection('admins').findOne({ username });
}

module.exports = { findByUsername };