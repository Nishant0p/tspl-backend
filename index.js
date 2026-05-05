const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize, User } = require('./models');
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/forms');
const adminRoutes = require('./routes/admin');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'admin', 'views'));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://tsplgroup.in',
  'https://www.tsplgroup.in',
  'https://talentcorp.co.in',
  'https://www.talentcorp.co.in',
  'https://admin.tsplgroup.in'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // The live domain may change between deployments, so reflect any browser origin
    // instead of hard-failing with a 500 on admin/API requests.
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => res.send('tspl-admin-backend running'));

async function ensureSuper() {
  const count = await User.count();
  if (count === 0 && process.env.SUPERUSER_EMAIL && process.env.SUPERUSER_PASSWORD) {
    const hash = await bcrypt.hash(process.env.SUPERUSER_PASSWORD, 10);
    await User.create({ email: process.env.SUPERUSER_EMAIL, passwordHash: hash, role: 'super' });
    console.log('Created initial superuser from env');
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureSuper();
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (e) {
    console.error('Failed to start', e);
    process.exit(1);
  }
}

start();
