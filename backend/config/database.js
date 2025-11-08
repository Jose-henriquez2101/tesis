const { Sequelize } = require('sequelize');
require('dotenv').config();

// Inicializa la instancia
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    // Provide a sensible default if DB_DIALECT is not set in the environment
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: console.log
  }
);

// Función para conectar a la base de datos
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos MySQL establecida correctamente.');
  } catch (error) {
    // Log full error for better diagnostics (stack/obj may contain more details)
    console.error('Error al conectar a la base de datos:', error && (error.message || error.stack || error));
  }
}

module.exports = {
  sequelize,
  connectDB
};