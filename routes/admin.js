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

// Add admin UI (only for authenticated super users)
router.get('/add-admin', authenticate, (req, res) => {
  if (!req.user || req.user.role !== 'super') return res.status(403).send('forbidden');
  res.render('add-admin', { user: req.user });
});

// Admin dashboard routes
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const section = req.query.section || 'contacts';

    if (!req.query.section) {
      const [contactCount, serviceCount, jobCount, recentContacts, recentServices, recentJobs] = await Promise.all([
        Contact.count(),
        Service.count(),
        Job.count(),
        Contact.findAll({ order: [['createdAt', 'DESC']], limit: 5 }),
        Service.findAll({ order: [['createdAt', 'DESC']], limit: 5 }),
        Job.findAll({ order: [['createdAt', 'DESC']], limit: 5 })
      ]);

      return res.render('dashboard', {
        stats: {
          contacts: contactCount,
          services: serviceCount,
          jobs: jobCount
        },
        recentContacts,
        recentServices,
        recentJobs,
        user: req.user
      });
    }
    
    if (section === 'contacts') {
      const items = await Contact.findAll({ order: [['createdAt', 'DESC']] });
      res.render('contacts', { items, user: req.user });
    } else if (section === 'services') {
      const items = await Service.findAll({ order: [['createdAt', 'DESC']] });
      res.render('services', { items, user: req.user });
    } else if (section === 'jobs') {
      const items = await Job.findAll({ order: [['createdAt', 'DESC']] });
      res.render('jobs', { items, user: req.user });
    } else {
      res.redirect('/admin/dashboard?section=contacts');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('Error loading dashboard');
  }
});

module.exports = router;
