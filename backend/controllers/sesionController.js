const sesionService = require('../services/sesionService');
const path = require('path');
const fs = require('fs');
const { SesionEntrenamiento } = require('../models');

// [C] CREATE: Controlador para registrar una nueva sesión (POST /api/sesiones)
async function crearSesion(req, res) {
  const datosSesion = req.body; 
  
  try {
    const nuevaSesion = await sesionService.registrarNuevaSesion(datosSesion);
    
    // Respuesta HTTP exitosa
    res.status(201).json({
      message: 'Sesión de entrenamiento registrada con éxito.',
      sesion: nuevaSesion
    });
  } catch (error) {
    // Si el servicio lanza un error, respondemos con un error del servidor (500) o un 400
    res.status(500).json({ 
      message: 'Error al registrar la sesión.', 
      error: error.message 
    });
  }
}

// [C] POST: Controlador para que Angular envíe la configuración final
async function prepararSimulacion(req, res) {
  // Datos enviados por Angular
  const { idBombero, idCapacitador, idEscenario, nombreEscenario, idInstanciaUnity, grabar } = req.body; 

  if (!idBombero || !idCapacitador || !idEscenario || !idInstanciaUnity) {
    return res.status(400).json({ message: 'Faltan datos de configuración para iniciar la simulación.' });
  }

  try {
    // 1. Registrar la sesión en la base de datos (Fecha actual, duración 0 por defecto)
    const datosSesion = {
      Duracion: '00:00:00',
      Fecha: new Date(),
      ID_Bombero_FK: idBombero,
      ID_Capacitador_FK: idCapacitador,
      ID_Escenario_FK: idEscenario
    };

    let nuevaSesion = null;
    try {
      nuevaSesion = await sesionService.registrarNuevaSesion(datosSesion);
      console.log('✅ Sesión registrada en BD:', nuevaSesion.ID_Sesion || nuevaSesion.id || nuevaSesion);
    } catch (dbErr) {
      console.warn('⚠️ No se pudo registrar la sesión en BD, pero seguiremos con la preparación de la simulación:', dbErr.message || dbErr);
      // No bloqueamos el envío a Unity por errores de BD
    }

    // 2. Obtener la instancia de Socket.io y la lista de clientes Unity
    const io = req.app.get('socketio');
    const unityClients = req.app.get('unityClients');

    // 3. Obtener el socket ID de la instancia de Unity a la que apuntamos
    const unitySocketId = unityClients.get(idInstanciaUnity);

    if (!unitySocketId) {
      // Si el socket de Unity no está conectado, respondemos con un error
      return res.status(404).json({ 
        message: `Instancia de Unity con ID ${idInstanciaUnity} no encontrada o no conectada.` 
      });
    }

    // 4. Emitir a Unity SOLO los datos necesarios para cargar escenario y vincular sesión
    io.to(unitySocketId).emit('load-scenario', {
      idEscenario: idEscenario,
      idSesion: nuevaSesion ? (nuevaSesion.ID_Sesion || nuevaSesion.id) : null
    });

    res.status(200).json({
      message: 'Simulación preparada y evento de escenario enviado a Unity.',
      targetUnityId: idInstanciaUnity,
      sesion: nuevaSesion
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error en la preparación de la simulación.', 
      error: error.message 
    });
  }
}

// [R] READ: Obtener una sesión por su ID (GET /api/sesiones/:id)
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

// [R] READ: Obtener todas las sesiones (GET /api/sesiones/)
async function obtenerTodasSesiones(req, res) {
  try {
    // **NOTA:** Necesitarías implementar obtenerTodasSesiones en el sesionService.js
    const sesiones = await sesionService.obtenerTodasSesiones(); 
    res.status(200).json(sesiones);
  } catch (error) {
    console.error('Error en controlador al obtener todas las sesiones:', error.message);
    res.status(500).json({ message: 'Error al obtener las sesiones.', error: error.message });
  }
}

// [R] READ: Obtener todas las sesiones de un bombero (GET /api/sesiones/bomberos/:id)
async function obtenerSesionesBombero(req, res) {
  // El ID del bombero viene como parámetro de la URL
  const ID_Bombero = req.params.id;
  
  try {
    const sesiones = await sesionService.obtenerSesionesPorBombero(ID_Bombero);
    
    res.status(200).json(sesiones);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener las sesiones del bombero.', 
      error: error.message 
    });
  }
}

// [U] UPDATE: Actualizar una sesión (PUT /api/sesiones/:id)
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

// [D] DELETE: Eliminar una sesión (DELETE /api/sesiones/:id)
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
  obtenerSesion,
  obtenerTodasSesiones,
  obtenerSesionesBombero,
  actualizarSesion,
  eliminarSesion,
  prepararSimulacion,
  subirAudioSesion,
  getAudioSesion
};

/**
 * Subir audio de una sesión y actualizar el registro en la base de datos
 * Método: PUT /api/v1/sesiones/:id/audio
 */
async function subirAudioSesion(req, res) {
  const ID_Sesion = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió archivo de audio.' });
  }

  try {
    // Buscar la sesión
    const sesion = await SesionEntrenamiento.findByPk(ID_Sesion);
    if (!sesion) {
      return res.status(404).json({ message: `Sesión ID ${ID_Sesion} no encontrada.` });
    }

    // Guardar el buffer del archivo en la BD (MEDIUMBLOB) y guardar el mime type
    const buffer = req.file.buffer;
    const mime = req.file.mimetype || 'application/octet-stream';

    sesion.Audio_Sesion = buffer;
    sesion.Audio_Mime = mime;
    await sesion.save();

    res.status(200).json({ message: 'Audio subido correctamente y guardado en BD.', sesion });
  } catch (error) {
    console.error('Error en subirAudioSesion:', error);
    res.status(500).json({ message: 'Error al procesar el audio.', error: error.message });
  }
}

/**
 * Servir audio almacenado en BD para una sesión
 * Método: GET /api/v1/sesiones/:id/audio
 */
async function getAudioSesion(req, res) {
  const ID_Sesion = req.params.id;
  try {
    const sesion = await SesionEntrenamiento.findByPk(ID_Sesion);
    if (!sesion) return res.status(404).json({ message: `Sesión ${ID_Sesion} no encontrada.` });

    const audioBlob = sesion.Audio_Sesion;
    const mime = sesion.Audio_Mime || 'application/octet-stream';

    if (!audioBlob) return res.status(404).json({ message: 'No hay audio para esta sesión.' });

    // audioBlob puede ser un Buffer (Node) o un objeto Buffer-like
    const buf = Buffer.isBuffer(audioBlob) ? audioBlob : Buffer.from(audioBlob);

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Length', buf.length);
    return res.status(200).send(buf);
  } catch (error) {
    console.error('Error en getAudioSesion:', error);
    return res.status(500).json({ message: 'Error al obtener audio.', error: error.message });
  }
}