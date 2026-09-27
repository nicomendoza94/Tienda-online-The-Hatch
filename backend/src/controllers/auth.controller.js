//archivo para manejar todo lo relacionado al admin para iniciar y cerrar sesión

const bcrypt = require('bcrypt');
const adminsModel = require('../models/admins.model');

//muestra el form de inicio de sesion
function showLoginForm(req, res) {
  if (req.session && req.session.adminId) {
    return res.redirect('/');         //si esta logeado redirige al dashboard
  }
  res.render('login', { title: 'Login - Larry Penguin Admin', error: null });   //Si no hay sesion activa
}

//funncion que valida credenciales y crea sesion
async function login(req, res) {
  const { username, password } = req.body;    //extrae esos dos campos del body

  if (!username || !password) {     //se validan los campos
    return res.render('login', {
      title: 'Login - Larry Penguin Admin',
      error: 'Username and password are required.',
    });
  }

  try {
    const admin = await adminsModel.findByUsername(username);  //se busca si existe el usuario en la bd

    if (!admin) {
      return res.render('login', {
        title: 'Login - Larry Penguin Admin',
        error: 'Invalid username or password.',
      });
    }
    //se verifica si la contraseña es correcta
    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatches) {
      return res.render('login', {
        title: 'Login - Larry Penguin Admin',
        error: 'Invalid username or password.',
      });
    }

    req.session.adminId = admin._id;   //se accede a la propiedad _id de admin y se agrega a una nueva propiedad adminId
    req.session.username = admin.username;

    res.redirect('/'); //redirecciona hacia el dashboard

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.render('login', {
      title: 'Login - Larry Penguin Admin',
      error: 'Something went wrong. Please try again.',
    });
  }
}

//funciom que destruye la sesion activa
function logout(req, res) {
  req.session.destroy((error) => {     //usa callback
    if (error) {
      console.error('❌ Logout error:', error.message);
    }
    res.redirect('/login');
  });
}

module.exports = { showLoginForm, login, logout };