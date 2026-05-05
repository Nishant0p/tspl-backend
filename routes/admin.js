const express = require('express');
const router = express.Router();
const { Contact, Service, Job } = require('../models');
const authController = require('../controllers/authController');
const { authenticate } = require('../utils/middleware');

router.get('/', (req, res) => {
  res.redirect('/admin/login');
});

router.get('/login', (req, res) => {
  res.render('login', { error: req.query.error === '1' });
});

router.post('/login', authController.login);

router.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  res.redirect('/admin/login');
});

// Admin dashboard routes
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const section = req.query.section || 'contacts';
    
    if (section === 'contacts') {
      const items = await Contact.findAll({ order: [['createdAt', 'DESC']] });
      res.render('contacts', { items });
    } else if (section === 'services') {
      const items = await Service.findAll({ order: [['createdAt', 'DESC']] });
      res.render('services', { items });
    } else if (section === 'jobs') {
      const items = await Job.findAll({ order: [['createdAt', 'DESC']] });
      res.render('jobs', { items });
    } else {
      res.redirect('/admin/dashboard?section=contacts');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('Error loading dashboard');
  }
});

module.exports = router;
