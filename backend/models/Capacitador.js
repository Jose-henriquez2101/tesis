const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Capacitador = sequelize.define('Capacitador', {
  ID_Capacitador: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'ID_Capacitador'
  },
  Nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  Contrasena: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Capacitador',
  timestamps: false
});

module.exports = Capacitador;