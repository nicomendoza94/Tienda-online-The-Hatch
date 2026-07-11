require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectDB } = require('./config/db');
const shopRoutes = require('./routes/shop.routes');
const ordersRoutes = require('./routes/orders.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Static files (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data (necesario para el formulario de checkout)
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  await connectDB();

  app.use('/', shopRoutes);
  app.use('/', ordersRoutes);

  app.listen(PORT, () => {
    console.log(`🚀 Store running on http://localhost:${PORT}`);
  });
}

startServer();