const { Sequelize } = require('sequelize');
require('dotenv').config();

// Inicializa la instancia
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false // Deshabilita los logs de SQL en la consola
  }
);

// Función para conectar a la base de datos
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos MySQL establecida correctamente.');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
  }
}

module.exports = {
  sequelize,
  connectDB
};