const { Capacitador } = require('../models');

// [C] CREATE: Crea un nuevo capacitador
async function crearCapacitador(datosCapacitador) {
  try {
    // Nota: Si implementaras seguridad, la contraseña se hashearía aquí antes de guardar.
    const nuevoCapacitador = await Capacitador.create(datosCapacitador);
    return nuevoCapacitador;
  } catch (error) {
    console.error("Error en servicio al crear capacitador:", error.message);
    throw new Error('No se pudo crear el registro del capacitador.');
  }
}

// [R] READ: Obtener todos los capacitadores
async function obtenerCapacitadores() {
  try {
    // Excluimos la contraseña en la respuesta para proteger la información
    const capacitadores = await Capacitador.findAll({
        attributes: { exclude: ['Contrasena'] }
    });
    return capacitadores;
  } catch (error) {
    console.error("Error en servicio al obtener capacitadores:", error.message);
    throw new Error('No se pudieron obtener los capacitadores.');
  }
}

// [R] READ: Obtener un capacitador por ID
async function obtenerCapacitadorPorId(ID_Capacitador) {
  try {
    const capacitador = await Capacitador.findByPk(ID_Capacitador, {
        attributes: { exclude: ['Contrasena'] }
    });

    if (!capacitador) {
      throw new Error(`Capacitador con ID ${ID_Capacitador} no encontrado.`);
    }

    return capacitador;
  } catch (error) {
    throw error;
  }
}

// [U] UPDATE: Actualizar un capacitador por ID
async function actualizarCapacitador(ID_Capacitador, datosActualizados) {
  try {
    // Verificar si el capacitador existe y actualizar
    const [filasAfectadas] = await Capacitador.update(datosActualizados, {
      where: { ID_Capacitador: ID_Capacitador }
    });

    if (filasAfectadas === 0) {
      throw new Error(`Capacitador con ID ${ID_Capacitador} no encontrado para actualizar.`);
    }

    // Obtener la instancia actualizada (sin la contraseña)
    const capacitadorActualizado = await obtenerCapacitadorPorId(ID_Capacitador);
    return capacitadorActualizado;
  } catch (error) {
    console.error("Error en servicio al actualizar capacitador:", error.message);
    throw error;
  }
}

// [D] DELETE: Eliminar un capacitador por ID
async function eliminarCapacitador(ID_Capacitador) {
  try {
    const filasEliminadas = await Capacitador.destroy({
      where: { ID_Capacitador: ID_Capacitador }
    });

    if (filasEliminadas === 0) {
      throw new Error(`Capacitador con ID ${ID_Capacitador} no encontrado para eliminar.`);
    }

    return { message: `Capacitador ID ${ID_Capacitador} eliminado con éxito.` };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  crearCapacitador,
  obtenerCapacitadores,
  obtenerCapacitadorPorId,
  actualizarCapacitador,
  eliminarCapacitador
};