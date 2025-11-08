const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bombero = sequelize.define('Bombero', {
  ID_Bombero: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'ID_Bombero'
  },
  Rut: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  NombreCompleto: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Bombero',
  timestamps: false
});

module.exports = Bombero;