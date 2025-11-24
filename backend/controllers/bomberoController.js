const bomberoService = require('../services/bomberoService');
// --- IMPORTACIONES FALTANTES AÑADIDAS ---
const path = require('path');
const fs = require('fs');
const { Bombero } = require('../models'); 
// ------------------------------------------

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

    // El servicio maneja la lógica de la base de datos
    const nuevoBombero = await bomberoService.crearBombero(req.body);

    res.status(201).json({
      message: 'Bombero creado con éxito desde el Panel Web.',
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
        
        // 1. Buscar el bombero usando el modelo importado
        const bombero = await Bombero.findByPk(bomberoId);

        if (!bombero) {
            // Borrar el archivo guardado por Multer si el registro no existe
            fs.unlinkSync(req.file.path); 
            return res.status(404).json({ message: 'Bombero no encontrado.' });
        }
        
        // 2. Borrar foto anterior si existe (para no dejar archivos huérfanos)
        if (bombero.Foto) {
             try {
                // __dirname es la carpeta 'controllers'. Debe ir dos niveles arriba ('..', '..') 
                // para llegar a la raíz del backend, luego 'assets', luego la ruta relativa guardada.
                const oldPhotoPath = path.join(__dirname, '..', '..', 'assets', bombero.Foto);
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                    console.log(`🗑️ Foto anterior borrada exitosamente: ${bombero.Foto}`);
                }
            } catch (cleanupError) {
                console.warn('⚠️ Error al borrar la foto anterior (posiblemente no existía):', cleanupError.message);
            }
        }


        // 3. Generar la ruta relativa para la DB
        // La ruta en DB debe ser la que Angular usará para acceder:
        // req.file.path ya incluye la ruta de guardado absoluta (ej: /ruta/al/proyecto/assets/bomberos/archivo.jpg)
        
        const pathSegments = req.file.path.split(path.sep);
        // Tomamos los últimos dos segmentos: 'bomberos' y el 'nombre_del_archivo.jpg'
        const relativePath = path.join(pathSegments[pathSegments.length - 2], pathSegments[pathSegments.length - 1]);
        
        // 4. Actualizar la base de datos
        bombero.Foto = relativePath;
        await bombero.save();

        res.status(200).json({ 
            message: 'Foto de bombero actualizada con éxito.', 
            fotoPath: `/${relativePath}` // Ruta de acceso para el frontend: /bomberos/archivo.jpg
        });

    } catch (error) {
        console.error("❌ Error CRÍTICO en uploadFotoBombero:", error);
        
        // Opcional: Borrar el archivo guardado por Multer si falló la DB
        if (req.file && req.file.path) {
             try {
                fs.unlinkSync(req.file.path); 
                console.log(`🗑️ Archivo temporal ${req.file.filename} borrado tras fallo de DB.`);
             } catch (unlinkError) {
                console.error("Error al intentar borrar el archivo tras fallo:", unlinkError.message);
             }
        }
        
        res.status(500).json({ 
            message: 'Error interno del servidor al procesar la foto.',
            internalError: error.message 
        });
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