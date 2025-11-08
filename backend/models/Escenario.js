const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Escenario = sequelize.define('Escenario', {
  id_Escenario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_Escenario'
  },
  NombreEscenario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  DescripcionEscenario: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Escenario',
  timestamps: false
});

module.exports = Escenario;