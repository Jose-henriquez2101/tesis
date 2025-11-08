const { Bombero } = require('../models');

// [C] CREATE: Crea un nuevo bombero
async function crearBombero(datosBombero) {
  try {
    console.log('🔧 Datos recibidos en servicio crearBombero:', datosBombero);
    console.log('🔧 Tipo de datos:', typeof datosBombero);
    
    // Validar datos requeridos
    if (!datosBombero.Rut || !datosBombero.NombreCompleto) {
      throw new Error('Rut y NombreCompleto son campos obligatorios');
    }
    
    console.log('🔄 Intentando crear bombero en la base de datos...');
    
    // Crear el bombero con los datos exactos del modelo
    const nuevoBombero = await Bombero.create({
      Rut: datosBombero.Rut,
      NombreCompleto: datosBombero.NombreCompleto
    });
    
    console.log('✅ Bombero creado exitosamente en BD:', nuevoBombero.toJSON());
    return nuevoBombero;
  } catch (error) {
    console.error("❌ Error en servicio al crear bombero:", error.message);
    console.error("🔍 Error details:", error);
    console.error("🔍 Error name:", error.name);
    console.error("🔍 Error code:", error.parent?.code);
    console.error("🔍 SQL:", error.parent?.sql);
    
    // Si es error de duplicado de RUT
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new Error('El RUT ya existe en el sistema');
    }
    
    throw new Error('No se pudo crear el registro del bombero: ' + error.message);
  }
}

// [R] READ: Obtener todos los bomberos
async function obtenerBomberos() {
  try {
    console.log('🔄 Obteniendo todos los bomberos de la BD...');
    const bomberos = await Bombero.findAll({
      order: [['ID_Bombero', 'ASC']]
    });
    
    console.log(`✅ Se obtuvieron ${bomberos.length} bomberos de la BD`);
    return bomberos;
  } catch (error) {
    console.error("❌ Error en servicio al obtener bomberos:", error.message);
    throw new Error('No se pudieron obtener los bomberos: ' + error.message);
  }
}

// [R] READ: Obtener un bombero por ID
async function obtenerBomberoPorId(ID_Bombero) {
  try {
    const bombero = await Bombero.findByPk(ID_Bombero);

    if (!bombero) {
      throw new Error(`Bombero con ID ${ID_Bombero} no encontrado.`);
    }

    return bombero;
  } catch (error) {
    throw error;
  }
}

// [U] UPDATE: Actualizar un bombero por ID
async function actualizarBombero(ID_Bombero, datosActualizados) {
  try {
    console.log('🔄 Actualizando bombero ID:', ID_Bombero);
    console.log('📝 Datos a actualizar:', datosActualizados);

    // Verificar si el bombero existe
    const [filasAfectadas] = await Bombero.update(datosActualizados, {
      where: { ID_Bombero: ID_Bombero }
    });

    if (filasAfectadas === 0) {
      throw new Error(`Bombero con ID ${ID_Bombero} no encontrado para actualizar.`);
    }

    // Obtener y retornar la instancia actualizada
    const bomberoActualizado = await obtenerBomberoPorId(ID_Bombero);
    console.log('✅ Bombero actualizado:', bomberoActualizado.toJSON());
    return bomberoActualizado;
  } catch (error) {
    console.error("❌ Error en servicio al actualizar bombero:", error.message);
    throw error;
  }
}

// [D] DELETE: Eliminar un bombero por ID
async function eliminarBombero(ID_Bombero) {
  try {
    const filasEliminadas = await Bombero.destroy({
      where: { ID_Bombero: ID_Bombero }
    });

    if (filasEliminadas === 0) {
      throw new Error(`Bombero con ID ${ID_Bombero} no encontrado para eliminar.`);
    }

    return { message: `Bombero ID ${ID_Bombero} eliminado con éxito.` };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  crearBombero,
  obtenerBomberos,
  obtenerBomberoPorId,
  actualizarBombero,
  eliminarBombero
};