const { Escenario } = require('../models');

// [C] CREATE: Crea un nuevo escenario
async function crearEscenario(datosEscenario) {
  try {
    const nuevoEscenario = await Escenario.create(datosEscenario);
    return nuevoEscenario;
  } catch (error) {
    console.error("Error en servicio al crear escenario:", error.message);
    throw new Error('No se pudo crear el registro del escenario.');
  }
}

// [R] READ: Obtener todos los escenarios
async function obtenerEscenarios() {
  try {
    const escenarios = await Escenario.findAll();
    return escenarios;
  } catch (error) {
    console.error("Error en servicio al obtener escenarios:", error.message);
    throw new Error('No se pudieron obtener los escenarios.');
  }
}

// [R] READ: Obtener un escenario por ID
async function obtenerEscenarioPorId(id_Escenario) {
  try {
    const escenario = await Escenario.findByPk(id_Escenario);

    if (!escenario) {
      throw new Error(`Escenario con ID ${id_Escenario} no encontrado.`);
    }

    return escenario;
  } catch (error) {
    throw error;
  }
}

// [U] UPDATE: Actualizar un escenario por ID
async function actualizarEscenario(id_Escenario, datosActualizados) {
  try {
    // Verificar si el escenario existe y actualizar
    const [filasAfectadas] = await Escenario.update(datosActualizados, {
      where: { id_Escenario: id_Escenario }
    });

    if (filasAfectadas === 0) {
      throw new Error(`Escenario con ID ${id_Escenario} no encontrado para actualizar.`);
    }

    // Obtener y retornar la instancia actualizada
    const escenarioActualizado = await obtenerEscenarioPorId(id_Escenario);
    return escenarioActualizado;
  } catch (error) {
    console.error("Error en servicio al actualizar escenario:", error.message);
    throw error;
  }
}

// [D] DELETE: Eliminar un escenario por ID
async function eliminarEscenario(id_Escenario) {
  try {
    const filasEliminadas = await Escenario.destroy({
      where: { id_Escenario: id_Escenario }
    });

    if (filasEliminadas === 0) {
      throw new Error(`Escenario con ID ${id_Escenario} no encontrado para eliminar.`);
    }

    return { message: `Escenario ID ${id_Escenario} eliminado con éxito.` };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  crearEscenario,
  obtenerEscenarios,
  obtenerEscenarioPorId,
  actualizarEscenario,
  eliminarEscenario
};