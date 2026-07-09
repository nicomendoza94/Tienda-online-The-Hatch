require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.get('/', (req, res) => {
    res.send('Larry Penguin Admin Panel - Backend is running 🐧');
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();