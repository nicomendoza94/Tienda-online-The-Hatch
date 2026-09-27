
//Middleware que verifica si existe una sesion activa y valida
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next(); // Paula is logged in, let the request continue
  }
  return res.redirect('/login');
}

module.exports = { requireAuth };