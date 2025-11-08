const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SesionEntrenamiento = sequelize.define('SesionEntrenamiento', {
  // Atributos de la tabla SesionEntrenamiento
  ID_Sesion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumimos que es autoincremental
    field: 'ID_Sesion' // Nombre exacto de la columna en la BD
  },
  Duracion: {
    type: DataTypes.TIME,
    allowNull: false
  },
  Fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Audio_Sesion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Las FKs no necesitan ser definidas si usamos 'associate' para las relaciones, 
  // pero las incluimos si necesitamos mapear campos específicos.
  ID_Capacitador_FK: { 
    type: DataTypes.INTEGER,
    field: 'ID_Capacitador_FK'
  },
  ID_Bombero_FK: {
    type: DataTypes.INTEGER,
    field: 'ID_Bombero_FK'
  },
  ID_Escenario_FK: {
    type: DataTypes.INTEGER,
    field: 'ID_Escenario_FK'
  }
}, {
  // Opciones del modelo
  tableName: 'SesionEntrenamiento', // Nombre exacto de la tabla
  timestamps: false // Asumimos que tu tabla no tiene createdAt y updatedAt
});

module.exports = SesionEntrenamiento;