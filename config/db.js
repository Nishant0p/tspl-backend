const { Sequelize } = require('sequelize');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Missing DATABASE_URL in env');
}

const sequelize = new Sequelize(connectionString, {
  logging: false,
  dialect: 'postgres'
});

module.exports = sequelize;
