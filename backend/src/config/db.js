const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGO_URI is not defined in .env file');
}

const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (db) return db;

  try {
    await client.connect();
    db = client.db(); // usa el nombre de base de datos que viene en la URI (larry_pinguino)
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

module.exports = { connectDB, getDB };