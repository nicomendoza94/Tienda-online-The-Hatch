// Handles admin authentication: login form, credential validation, logout.
// Data access is delegated to the admins model.

const bcrypt = require('bcrypt');
const adminsModel = require('../models/admins.model');

// Renders the login form
function showLoginForm(req, res) {
  if (req.session && req.session.adminId) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login - Larry Penguin Admin', error: null });
}

// Validates credentials and creates the session
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login', {
      title: 'Login - Larry Penguin Admin',
      error: 'Username and password are required.',
    });
  }

  try {
    const admin = await adminsModel.findByUsername(username);

    if (!admin) {
      return res.render('login', {
        title: 'Login - Larry Penguin Admin',
        error: 'Invalid username or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatches) {
      return res.render('login', {
        title: 'Login - Larry Penguin Admin',
        error: 'Invalid username or password.',
      });
    }

    req.session.adminId = admin._id;
    req.session.username = admin.username;

    res.redirect('/');
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.render('login', {
      title: 'Login - Larry Penguin Admin',
      error: 'Something went wrong. Please try again.',
    });
  }
}

// Destroys the session and logs Paula out
function logout(req, res) {
  req.session.destroy((error) => {
    if (error) {
      console.error('❌ Logout error:', error.message);
    }
    res.redirect('/login');
  });
}

module.exports = { showLoginForm, login, logout };