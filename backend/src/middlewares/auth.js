// Middleware that protects admin routes.
// If there's no active session (Paula hasn't logged in), redirect to login.
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next(); // Paula is logged in, let the request continue
  }
  return res.redirect('/login');
}

module.exports = { requireAuth };