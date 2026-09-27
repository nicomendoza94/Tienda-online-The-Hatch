require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const methodOverride = require('method-override');
const { connectDB } = require('./config/db');
const { requireAuth } = require('./middlewares/auth');
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const ordersRoutes = require('./routes/orders.routes');

const app = express();
const PORT = process.env.PORT || 3000;

//para renderizar una vista
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//sirve archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

//interpreta el body de los formularios
app.use(express.urlencoded({ extended: true }));

//simula PUT/DELETE desde formularios HTML,que solo soportan GET/POST
//busca el campo "_method" en el querystring o el body del form
app.use(methodOverride('_method'));

async function startServer() {
  await connectDB();

  // Sessions (persistidas en MongoDB, no en memoria)
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,           //para no no reguardar la sesion en la base de datos en cada request
    saveUninitialized: false,
    store: MongoStore.create({           //donde guardar los datos de las sesiones
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {       //configuracion de la cookie que se manda al navegador
      httpOnly: true,    //proteccion contra ataque XSS
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 2, //tiempo de la cookie 2 horas
    },
  }));

  //rutas
  app.use('/', authRoutes);

  //solo admin puede gestionar productos
  app.use('/products', requireAuth, productsRoutes);

  app.use('/orders', requireAuth, ordersRoutes);

  //Dashboard protegido, requiere sesion activa
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