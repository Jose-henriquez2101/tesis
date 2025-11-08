const sesionService = require('../services/sesionService');

// CREATE (C) - Ya existente
async function crearSesion(req, res) {
  // ... (código anterior)
}

// READ (R) - Obtener una sesión por su ID (Nuevo)
async function obtenerSesion(req, res) {
  const ID_Sesion = req.params.id;
  
  try {
    const sesion = await sesionService.obtenerSesionPorId(ID_Sesion);
    
    res.status(200).json(sesion);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al obtener la sesión.', error: error.message });
    }
  }
}

// READ (R) - Obtener todas las sesiones (Nuevo)
async function obtenerTodasSesiones(req, res) {
  try {
    const sesiones = await sesionService.obtenerTodasSesiones();
    res.status(200).json(sesiones);
  } catch (error) {
    console.error('Error en controlador al obtener todas las sesiones:', error.message);
    res.status(500).json({ message: 'Error al obtener las sesiones.', error: error.message });
  }
}

// READ (R) - Obtener todas las sesiones de un bombero (Ya existente)
async function obtenerSesionesBombero(req, res) {
  // ... (código anterior)
}

// UPDATE (U) - (Nuevo)
async function actualizarSesion(req, res) {
  const ID_Sesion = req.params.id;
  const datosActualizados = req.body;
  
  try {
    const sesionActualizada = await sesionService.actualizarSesion(ID_Sesion, datosActualizados);
    
    res.status(200).json({
      message: `Sesión ID ${ID_Sesion} actualizada con éxito.`,
      sesion: sesionActualizada
    });
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al actualizar la sesión.', error: error.message });
    }
  }
}

// DELETE (D) - (Nuevo)
async function eliminarSesion(req, res) {
  const ID_Sesion = req.params.id;
  
  try {
    const resultado = await sesionService.eliminarSesion(ID_Sesion);
    
    // Respuesta de éxito sin contenido (204 No Content) es común para DELETE
    res.status(204).json(resultado); 
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al eliminar la sesión.', error: error.message });
    }
  }
}

module.exports = {
  crearSesion,
  obtenerSesion,             // Nuevo
  obtenerTodasSesiones,     // Nuevo
  obtenerSesionesBombero,
  actualizarSesion,          // Nuevo
  eliminarSesion             // Nuevo
};