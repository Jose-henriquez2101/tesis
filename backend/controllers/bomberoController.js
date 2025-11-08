const bomberoService = require('../services/bomberoService');

// [C] POST: Crear un nuevo bombero
async function crearBombero(req, res) {
  try {
    const nuevoBombero = await bomberoService.crearBombero(req.body);
    
    // Obtener la instancia de Socket.io
    const io = req.app.get('socketio');
    
    // Emitir el evento a todos los clientes (Angular web)
    io.emit('bombero-listo', {
      evento: "bombero-listo",
      data: {
        idBombero: nuevoBombero.ID_Bombero, // Asume que el servicio retorna el ID
        nombre: nuevoBombero.NombreCompleto,
        rut: nuevoBombero.Rut
      }
    });
    
    res.status(201).json({
      message: 'Bombero creado con éxito y evento emitido a la Web.',
      bombero: nuevoBombero
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el bombero.',
      error: error.message
    });
  }
}

// [R] GET: Obtener todos los bomberos
async function obtenerBomberos(req, res) {
  try {
    const bomberos = await bomberoService.obtenerBomberos();
    res.status(200).json(bomberos);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los bomberos.',
      error: error.message
    });
  }
}

// [R] GET: Obtener un bombero por ID
async function obtenerBombero(req, res) {
  const ID_Bombero = req.params.id;

  try {
    const bombero = await bomberoService.obtenerBomberoPorId(ID_Bombero);
    res.status(200).json(bombero);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al obtener el bombero.', error: error.message });
    }
  }
}

// [U] PUT: Actualizar un bombero por ID
async function actualizarBombero(req, res) {
  const ID_Bombero = req.params.id;
  const datosActualizados = req.body;

  try {
    const bomberoActualizado = await bomberoService.actualizarBombero(ID_Bombero, datosActualizados);

    res.status(200).json({
      message: `Bombero ID ${ID_Bombero} actualizado con éxito.`,
      bombero: bomberoActualizado
    });
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al actualizar el bombero.', error: error.message });
    }
  }
}

// [D] DELETE: Eliminar un bombero por ID
async function eliminarBombero(req, res) {
  const ID_Bombero = req.params.id;

  try {
    const resultado = await bomberoService.eliminarBombero(ID_Bombero);
    // 204 No Content es la respuesta estándar para DELETE exitoso
    res.status(204).json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al eliminar el bombero.', error: error.message });
    }
  }
}

module.exports = {
  crearBombero,
  obtenerBomberos,
  obtenerBombero,
  actualizarBombero,
  eliminarBombero
};