// const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRegister = sequelize.define('UserRegister', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = UserRegister;
