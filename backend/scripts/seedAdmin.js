// Script to create the initial admin user (Paula) with a hashed password.
// Run this ONCE with: node scripts/seedAdmin.js
// It connects directly to MongoDB (not through the app) since it's a one-off setup task.

require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const readline = require('readline');

const SALT_ROUNDS = 10;

// Simple CLI prompt helper so we don't hardcode credentials in the script
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (answer) => {
    rl.close();
    resolve(answer);
  }));
}

async function seedAdmin() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const admins = db.collection('admins');

    const username = await askQuestion('Enter admin username (e.g. paula): ');
    const password = await askQuestion('Enter admin password: ');

    if (!username || !password) {
      console.error('❌ Username and password cannot be empty');
      process.exit(1);
    }

    // Check if this admin already exists to avoid duplicates
    const existingAdmin = await admins.findOne({ username });
    if (existingAdmin) {
      console.log(`⚠️  Admin "${username}" already exists. Aborting.`);
      process.exit(0);
    }

    // Hash the password before storing it (never store plain text passwords)
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await admins.insertOne({
      username,
      passwordHash,
      createdAt: new Date(),
    });

    console.log(`✅ Admin "${username}" created successfully.`);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  } finally {
    await client.close();
  }
}

seedAdmin();