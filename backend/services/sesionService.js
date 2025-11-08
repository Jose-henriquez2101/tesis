const { SesionEntrenamiento, Bombero, Capacitador, Escenario } = require('../models');

// Función CREATE (C) - Ya existente
async function registrarNuevaSesion(datosSesion) {
  try {
    // ... (lógica de validación)
    const nuevaSesion = await SesionEntrenamiento.create(datosSesion);
    return nuevaSesion;
  } catch (error) {
    // Log full error and rethrow it so controller can surface useful diagnostics
    console.error('Error en servicio al registrar sesión:', error && (error.message || error.stack || error));
    // Rethrow a descriptive error that preserves original message for debugging
    throw new Error('No se pudo registrar la sesión de entrenamiento. ' + (error.message || error));
  }
}

// Función READ (R) - Nueva función para obtener una sola sesión por ID
async function obtenerSesionPorId(idSesion) {
  try {
    const sesion = await SesionEntrenamiento.findByPk(idSesion, {
      include: [
        { model: Bombero, as: 'bombero', attributes: ['ID_Bombero', 'NombreCompleto', 'Rut'] },
        { model: Capacitador, as: 'capacitador', attributes: ['ID_Capacitador', 'Nombre'] },
        { model: Escenario, as: 'escenario', attributes: ['id_Escenario', 'NombreEscenario'] }
      ]
    });
    
    if (!sesion) {
      // Usaremos un error específico que el controlador pueda mapear a un 404
      throw new Error(`Sesión con ID ${idSesion} no encontrada.`);
    }
    
    return sesion;
  } catch (error) {
    throw error; // Re-lanza el error (ya sea de no encontrado o de base de datos)
  }
}

// Función READ (R) - Ya existente (obtener por bombero)
async function obtenerSesionesPorBombero(ID_Bombero) {
  try {
    // ... (lógica de consulta)
    const sesiones = await SesionEntrenamiento.findAll({
      where: { ID_Bombero_FK: ID_Bombero },
      include: [
        { model: Bombero, as: 'bombero', attributes: ['ID_Bombero', 'NombreCompleto', 'Rut'] },
        { model: Capacitador, as: 'capacitador', attributes: ['ID_Capacitador', 'Nombre'] },
        { model: Escenario, as: 'escenario', attributes: ['id_Escenario', 'NombreEscenario'] }
      ]
    });
    return sesiones;
  } catch (error) {
    console.error("Error en servicio al obtener sesiones:", error.message);
    throw new Error('No se pudieron obtener las sesiones del bombero.');
  }
}

// Función READ (R) - Obtener todas las sesiones (Nuevo)
async function obtenerTodasSesiones() {
  try {
    const sesiones = await SesionEntrenamiento.findAll({
      include: [
        { model: Bombero, as: 'bombero', attributes: ['ID_Bombero', 'NombreCompleto', 'Rut'] },
        { model: Capacitador, as: 'capacitador', attributes: ['ID_Capacitador', 'Nombre'] },
        { model: Escenario, as: 'escenario', attributes: ['id_Escenario', 'NombreEscenario'] }
      ]
    });
    return sesiones;
  } catch (error) {
    console.error('Error en servicio al obtener todas las sesiones:', error.message);
    throw new Error('No se pudieron obtener las sesiones.');
  }
}

// Función UPDATE (U)
async function actualizarSesion(idSesion, datosActualizados) {
  try {
    // 1. Busca la sesión para verificar si existe
    const sesion = await SesionEntrenamiento.findByPk(idSesion);
    
    if (!sesion) {
      throw new Error(`Sesión con ID ${idSesion} no encontrada para actualizar.`);
    }
    
    // 2. Aplica la actualización
    // El método update devuelve [número_de_filas_afectadas, filas_afectadas]
    const [filasAfectadas] = await SesionEntrenamiento.update(datosActualizados, {
      where: { ID_Sesion: idSesion }
    });
    
    // 3. Opcional: Obtener la sesión actualizada para retornarla
    const sesionActualizada = await SesionEntrenamiento.findByPk(idSesion);
    
    return sesionActualizada;
  } catch (error) {
    console.error("Error en servicio al actualizar sesión:", error.message);
    throw new Error('No se pudo actualizar la sesión de entrenamiento.');
  }
}

// Función DELETE (D)
async function eliminarSesion(idSesion) {
  try {
    const filasEliminadas = await SesionEntrenamiento.destroy({
      where: { ID_Sesion: idSesion }
    });
    
    if (filasEliminadas === 0) {
      // Usaremos un error específico que el controlador pueda mapear a un 404
      throw new Error(`Sesión con ID ${idSesion} no encontrada para eliminar.`);
    }
    
    return { message: `Sesión ID ${idSesion} eliminada con éxito.` };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  registrarNuevaSesion,
  obtenerSesionPorId, // Nuevo método READ
  obtenerTodasSesiones,
  obtenerSesionesPorBombero,
  actualizarSesion,   // Nuevo método UPDATE
  eliminarSesion      // Nuevo método DELETE
};