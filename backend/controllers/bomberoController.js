const bomberoService = require('../services/bomberoService');

// [C] POST: Crear un nuevo bombero
async function crearBombero(req, res) {
  try {
    console.log('📥 Datos recibidos en crearBombero:', req.body);
    
    // Validar datos requeridos
    if (!req.body.Rut || !req.body.NombreCompleto) {
      return res.status(400).json({
        message: 'Rut y NombreCompleto son campos obligatorios'
      });
    }

    const nuevoBombero = await bomberoService.crearBombero(req.body);
    
    console.log('✅ Bombero creado exitosamente:', nuevoBombero);
    res.status(201).json({
      message: 'Bombero creado con éxito.',
      bombero: nuevoBombero
    });
  } catch (error) {
    console.error('❌ Error en crearBombero:', error);
    console.error('🔍 Stack trace completo:', error.stack);
    res.status(500).json({
      message: 'Error al crear el bombero.',
      error: error.message
    });
  }
}

// [R] GET: Obtener todos los bomberos
async function obtenerBomberos(req, res) {
  try {
    console.log('📥 Solicitando todos los bomberos');
    const bomberos = await bomberoService.obtenerBomberos();
    
    console.log(`✅ Se encontraron ${bomberos.length} bomberos`);
    res.status(200).json(bomberos);
  } catch (error) {
    console.error('❌ Error en obtenerBomberos:', error);
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
    res.status(200).json(resultado);
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