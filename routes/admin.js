const express = require('express');
const router = express.Router();
const { Contact, Service, Job } = require('../models');
const { authenticate } = require('../utils/middleware');

router.get('/', (req, res) => {
  res.redirect('/admin/login');
});

router.get('/login', (req, res) => {
  res.render('login');
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
