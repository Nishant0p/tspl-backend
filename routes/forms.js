const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../utils/middleware');
require('dotenv').config();

const UPLOAD_DIR = path.join(__dirname, '../public/uploads/cvs');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOAD_DIR); },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, name);
  }
});
const upload = multer({ storage });

router.post('/submit', upload.fields([{ name: 'pdf' }, { name: 'cv' }]), formController.submit);
router.get('/list/:section', authenticate, formController.list);
router.get('/preview/:filename', authenticate, formController.preview);
router.get('/download/:filename', authenticate, formController.download);

module.exports = router;
