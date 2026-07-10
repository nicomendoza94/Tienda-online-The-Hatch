require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const methodOverride = require('method-override');
const { connectDB } = require('./config/db');
const { requireAuth } = require('./middlewares/auth');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Static files (CSS, uploaded images)
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data (necesario para formularios de login, productos, etc.)
app.use(express.urlencoded({ extended: true }));

// Simula PUT/DELETE desde formularios HTML (que solo soportan GET/POST)
app.use(methodOverride('_method'));

async function startServer() {
  await connectDB();

  // Sessions (persistidas en MongoDB, no en memoria)
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      httpOnly: true, // el cookie no es accesible desde JS del navegador
      secure: process.env.NODE_ENV === 'production', // solo HTTPS en producción
      maxAge: 1000 * 60 * 60 * 2, // 2 horas
    },
  }));

  // Auth routes (/login, /logout) - no requieren estar logueado
  app.use('/', authRoutes);

  // Dashboard - protegido, requiere sesión activa
  app.get('/', requireAuth, (req, res) => {
    res.render('dashboard', {
      title: 'Larry Penguin - Admin Panel',
      username: req.session.username,
    });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();