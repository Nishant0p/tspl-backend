const sequelize = require('../config/db');
const User = require('./user');
const Contact = require('./contact');
const Service = require('./service');
const Job = require('./job');

module.exports = {
  sequelize,
  User,
  Contact,
  Service,
  Job
};
