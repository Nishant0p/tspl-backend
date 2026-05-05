const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function getCookieToken(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const tokenCookie = cookies.find((cookie) => cookie.startsWith('admin_token='));
  return tokenCookie ? decodeURIComponent(tokenCookie.slice('admin_token='.length)) : null;
}

exports.authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  const cookieToken = getCookieToken(req.headers.cookie);
  const token = auth && auth.startsWith('Bearer ') ? auth.split(' ')[1] : cookieToken;
  const accept = req.headers.accept || '';
  const wantsBrowser = accept.includes('text/html') || accept.includes('application/xhtml+xml');

  if (!token) {
    console.log('authenticate: missing token', { path: req.path, wantsBrowser });
    if (wantsBrowser) return res.redirect('/admin/login');
    return res.status(401).json({ error: 'missing_auth' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    console.log('authenticate: invalid token', { err: e && e.message, path: req.path, wantsBrowser });
    if (wantsBrowser) return res.redirect('/admin/login');
    res.status(401).json({ error: 'invalid_token' });
  }
};
