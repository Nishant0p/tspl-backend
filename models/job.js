const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Job = sequelize.define('Job', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT },
  pdf: { type: DataTypes.STRING },
  cv: { type: DataTypes.STRING },
  metadata: { type: DataTypes.JSONB }
}, { tableName: 'jobs' });

module.exports = Job;
