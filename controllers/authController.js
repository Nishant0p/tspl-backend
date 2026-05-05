const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

exports.login = async (req, res) => {
  const acceptHeader = req.headers.accept || '';
  const wantsBrowserRedirect = req.body.browserLogin === '1' || acceptHeader.includes('text/html') || acceptHeader.includes('application/xhtml+xml');

  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing' });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      if (wantsBrowserRedirect) return res.redirect('/admin/login?error=1');
      return res.status(401).json({ error: 'invalid' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      if (wantsBrowserRedirect) return res.redirect('/admin/login?error=1');
      return res.status(401).json({ error: 'invalid' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
    const cookieOptions = [
      'admin_token=' + token,
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      'Max-Age=' + (12 * 60 * 60)
    ];

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieOptions.join('; '));

    if (wantsBrowserRedirect) {
      return res.redirect('/admin/dashboard');
    }

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login failed', error);
    if (wantsBrowserRedirect) {
      return res.redirect('/admin/login?error=1');
    }
    res.status(500).json({ error: 'login_failed' });
  }
};

exports.createAdmin = async (req, res) => {
  // only superuser
  if (!req.user || req.user.role !== 'super') return res.status(403).json({ error: 'forbidden' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing' });
  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(400).json({ error: 'exists' });
  const hash = await bcrypt.hash(password, 10);
  const created = await User.create({ email, passwordHash: hash, role: 'admin' });
  res.json({ id: created.id, email: created.email });
};
