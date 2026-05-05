const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contact = sequelize.define('Contact', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT },
  metadata: { type: DataTypes.JSONB }
}, { tableName: 'contacts' });

module.exports = Contact;
