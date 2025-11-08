const { Bombero } = require('../models');

// [C] CREATE: Crea un nuevo bombero
async function crearBombero(datosBombero) {
  try {
    const nuevoBombero = await Bombero.create(datosBombero);
    return nuevoBombero;
  } catch (error) {
    console.error("Error en servicio al crear bombero:", error.message);
    throw new Error('No se pudo crear el registro del bombero.');
  }
}

// [R] READ: Obtener todos los bomberos
async function obtenerBomberos() {
  try {
    const bomberos = await Bombero.findAll();
    return bomberos;
  } catch (error) {
    console.error("Error en servicio al obtener bomberos:", error.message);
    throw new Error('No se pudieron obtener los bomberos.');
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
    // Verificar si el bombero existe
    const [filasAfectadas] = await Bombero.update(datosActualizados, {
      where: { ID_Bombero: ID_Bombero }
    });

    if (filasAfectadas === 0) {
      throw new Error(`Bombero con ID ${ID_Bombero} no encontrado para actualizar.`);
    }

    // Obtener y retornar la instancia actualizada
    const bomberoActualizado = await obtenerBomberoPorId(ID_Bombero);
    return bomberoActualizado;
  } catch (error) {
    console.error("Error en servicio al actualizar bombero:", error.message);
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