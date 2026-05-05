/**
 * requireAuth.js
 * Ensures routes run only for logged-in users (session.userId set after login).
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  /** Sub-routers mount at `/api`; `req.path` is relative to mount — use full URL. */
  const isJsonApi = req.originalUrl.startsWith('/api');
  if (isJsonApi) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  return res.redirect('/login');
}

module.exports = { requireAuth };
