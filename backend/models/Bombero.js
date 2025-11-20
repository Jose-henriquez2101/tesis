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
  },
  Foto: {
    type: DataTypes.STRING, // VARCHAR(255)
      allowNull: true,
      // Almacenaremos la ruta relativa, ej: "bomberos/bombero-42-1701234567.jpg"
  },
  FechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  FechaDeIncorporacion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
}, {
  tableName: 'Bombero',
  timestamps: false
});

module.exports = Bombero;