const express = require('express');
const router = express.Router();
const { showLoginForm, login, logout } = require('../controllers/auth.controller');

router.get('/login', showLoginForm);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;