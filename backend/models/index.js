const Bombero = require('./Bombero');
const Capacitador = require('./Capacitador');
const Escenario = require('./Escenario');
const SesionEntrenamiento = require('./SesionEntrenamiento');

// --- Definición de Relaciones ---

// 1. Bombero (One) <--- SesionEntrenamiento (Many)
Bombero.hasMany(SesionEntrenamiento, {
  foreignKey: 'ID_Bombero_FK', // La columna FK en la tabla SesionEntrenamiento
  as: 'sesiones' // Alias para incluir en consultas: Bombero.findAll({ include: 'sesiones' })
});
SesionEntrenamiento.belongsTo(Bombero, {
  foreignKey: 'ID_Bombero_FK',
  as: 'bombero'
});

// 2. Capacitador (One) <--- SesionEntrenamiento (Many)
Capacitador.hasMany(SesionEntrenamiento, {
  foreignKey: 'ID_Capacitador_FK',
  as: 'sesiones_impartidas'
});
SesionEntrenamiento.belongsTo(Capacitador, {
  foreignKey: 'ID_Capacitador_FK',
  as: 'capacitador'
});

// 3. Escenario (One) <--- SesionEntrenamiento (Many)
Escenario.hasMany(SesionEntrenamiento, {
  foreignKey: 'ID_Escenario_FK',
  as: 'sesiones_realizadas'
});
SesionEntrenamiento.belongsTo(Escenario, {
  foreignKey: 'ID_Escenario_FK',
  as: 'escenario'
});

module.exports = {
  Bombero,
  Capacitador,
  Escenario,
  SesionEntrenamiento,
  sequelize: require('../config/database').sequelize // Exporta la instancia de Sequelize
};