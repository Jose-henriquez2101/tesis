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
// Subir y actualizar la foto de un bombero
const uploadFotoBombero = async (req, res) => {
    // Multer ya guardó el archivo si no hubo errores.
    if (!req.file) {
        return res.status(400).json({ message: 'No se encontró el archivo de la foto.' });
    }

    try {
        const bomberoId = req.params.bomberoId;
        const bombero = await Bombero.findByPk(bomberoId);

        if (!bombero) {
            // Opcional: Si el bombero no existe, puedes borrar el archivo guardado por Multer
            // fs.unlinkSync(req.file.path); 
            return res.status(404).json({ message: 'Bombero no encontrado.' });
        }

        // Generar la ruta relativa para la DB
        // La ruta en DB debe ser la que Angular usará para acceder:
        // Quita la parte del path base (assets/) que ya está configurada en server.js
        const pathSegments = req.file.path.split(path.sep);
        const relativePath = path.join(pathSegments[pathSegments.length - 2], pathSegments[pathSegments.length - 1]); // ej: "bomberos/bombero-42-1701234567.jpg"
        
        // Actualizar la base de datos
        bombero.Foto = relativePath;
        await bombero.save();

        res.status(200).json({ 
            message: 'Foto de bombero actualizada con éxito.', 
            fotoPath: `/${relativePath}` // Ruta de acceso para el frontend: /bomberos/archivo.jpg
        });

    } catch (error) {
        console.error("Error al actualizar la foto del bombero:", error);
        // Opcional: Borrar el archivo si falló la DB
        // fs.unlinkSync(req.file.path); 
        res.status(500).json({ message: 'Error interno del servidor al procesar la foto.' });
    }
};
module.exports = {
  crearBombero,
  obtenerBomberos,
  obtenerBombero,
  actualizarBombero,
  eliminarBombero,
  uploadFotoBombero
};