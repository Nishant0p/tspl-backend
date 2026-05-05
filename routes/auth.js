const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../utils/middleware');

router.post('/login', authController.login);
router.post('/admins', authenticate, authController.createAdmin);

module.exports = router;
