const capacitadorService = require('../services/capacitadorService');

// [A] POST: Login / Autenticar capacitador
async function loginCapacitador(req, res) {
  const { Correo, Contrasena } = req.body;
  try {
    const capacitador = await capacitadorService.autenticarCapacitador({ Correo, Contrasena });
    // Devuelve 200 con el capacitador (sin contraseña). En producción, deberías devolver un token JWT.
    res.status(200).json({ message: 'Autenticación exitosa', capacitador });
  } catch (error) {
    // Credenciales inválidas -> 401
    const msg = error && error.message ? error.message : 'Error de autenticación';
    if (msg.includes('Credenciales inválidas')) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }
    return res.status(500).json({ message: 'Error en autenticación', error: msg });
  }
}

// [C] POST: Crear un nuevo capacitador
async function crearCapacitador(req, res) {
  try {
    const nuevoCapacitador = await capacitadorService.crearCapacitador(req.body);
    res.status(201).json({
      message: 'Capacitador creado con éxito.',
      capacitador: nuevoCapacitador
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el capacitador.',
      error: error.message
    });
  }
}

// [R] GET: Obtener todos los capacitadores
async function obtenerCapacitadores(req, res) {
  try {
    const capacitadores = await capacitadorService.obtenerCapacitadores();
    res.status(200).json(capacitadores);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los capacitadores.',
      error: error.message
    });
  }
}

// [R] GET: Obtener un capacitador por ID
async function obtenerCapacitador(req, res) {
  const ID_Capacitador = req.params.id;

  try {
    const capacitador = await capacitadorService.obtenerCapacitadorPorId(ID_Capacitador);
    res.status(200).json(capacitador);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al obtener el capacitador.', error: error.message });
    }
  }
}

// [U] PUT: Actualizar un capacitador por ID
async function actualizarCapacitador(req, res) {
  const ID_Capacitador = req.params.id;
  const datosActualizados = req.body;

  try {
    const capacitadorActualizado = await capacitadorService.actualizarCapacitador(ID_Capacitador, datosActualizados);

    res.status(200).json({
      message: `Capacitador ID ${ID_Capacitador} actualizado con éxito.`,
      capacitador: capacitadorActualizado
    });
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al actualizar el capacitador.', error: error.message });
    }
  }
}

// [D] DELETE: Eliminar un capacitador por ID
async function eliminarCapacitador(req, res) {
  const ID_Capacitador = req.params.id;

  try {
    const resultado = await capacitadorService.eliminarCapacitador(ID_Capacitador);
    res.status(204).json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al eliminar el capacitador.', error: error.message });
    }
  }
}

module.exports = {
  loginCapacitador,
  crearCapacitador,
  obtenerCapacitadores,
  obtenerCapacitador,
  actualizarCapacitador,
  eliminarCapacitador
};