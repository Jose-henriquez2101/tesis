const escenarioService = require('../services/escenarioService');

// [C] POST: Crear un nuevo escenario
async function crearEscenario(req, res) {
  try {
    const nuevoEscenario = await escenarioService.crearEscenario(req.body);
    res.status(201).json({
      message: 'Escenario creado con éxito.',
      escenario: nuevoEscenario
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el escenario.',
      error: error.message
    });
  }
}

// [R] GET: Obtener todos los escenarios
async function obtenerEscenarios(req, res) {
  try {
    const escenarios = await escenarioService.obtenerEscenarios();
    res.status(200).json(escenarios);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los escenarios.',
      error: error.message
    });
  }
}

// [R] GET: Obtener un escenario por ID
async function obtenerEscenario(req, res) {
  const id_Escenario = req.params.id;

  try {
    const escenario = await escenarioService.obtenerEscenarioPorId(id_Escenario);
    res.status(200).json(escenario);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al obtener el escenario.', error: error.message });
    }
  }
}

// [U] PUT: Actualizar un escenario por ID
async function actualizarEscenario(req, res) {
  const id_Escenario = req.params.id;
  const datosActualizados = req.body;

  try {
    const escenarioActualizado = await escenarioService.actualizarEscenario(id_Escenario, datosActualizados);

    res.status(200).json({
      message: `Escenario ID ${id_Escenario} actualizado con éxito.`,
      escenario: escenarioActualizado
    });
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al actualizar el escenario.', error: error.message });
    }
  }
}

// [D] DELETE: Eliminar un escenario por ID
async function eliminarEscenario(req, res) {
  const id_Escenario = req.params.id;

  try {
    const resultado = await escenarioService.eliminarEscenario(id_Escenario);
    res.status(204).json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al eliminar el escenario.', error: error.message });
    }
  }
}

module.exports = {
  crearEscenario,
  obtenerEscenarios,
  obtenerEscenario,
  actualizarEscenario,
  eliminarEscenario
};