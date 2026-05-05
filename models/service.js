const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Service = sequelize.define('Service', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT },
  metadata: { type: DataTypes.JSONB }
}, { tableName: 'services' });

module.exports = Service;
