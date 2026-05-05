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

  if (!token) return res.status(401).json({ error: 'missing_auth' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: 'invalid_token' });
  }
};
