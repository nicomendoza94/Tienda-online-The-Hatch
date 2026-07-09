require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Static files (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data (necesario para los formularios de login, productos, etc.)
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  await connectDB();

  app.get('/', (req, res) => {
    res.render('dashboard', { title: 'Larry Penguin - Admin Panel' });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();