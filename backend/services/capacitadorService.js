const { Capacitador } = require('../models');
const bcrypt = require('bcrypt');

// Definimos el factor de coste (cuán segura/lenta será la encriptación)
const SALT_ROUNDS = 10;

// [C] CREATE: Crea un nuevo capacitador
async function crearCapacitador(datosCapacitador) {
  try {
    // 1. Hashear la contraseña antes de guardar
    if (datosCapacitador.Contrasena) {
      const hashedPassword = await bcrypt.hash(datosCapacitador.Contrasena, SALT_ROUNDS);
      // Reemplazamos la contraseña plana con el hash
      datosCapacitador.Contrasena = hashedPassword;
    }
    
    const nuevoCapacitador = await Capacitador.create(datosCapacitador);
    
    // Devolvemos el objeto, asegurándonos de NO incluir la contraseña hasheada
    // (Sequelize ya debería excluirla en el método findByPk del controlador, pero es buena práctica)
    const { Contrasena, ...rest } = nuevoCapacitador.toJSON();
    return rest;
  } catch (error) {
    console.error("Error en servicio al crear capacitador:", error.message);
    throw new Error('No se pudo crear el registro del capacitador.');
  }
}

// [A] AUTH: Autenticar capacitador por correo y contraseña
async function autenticarCapacitador({ Correo, Contrasena }) {
  try {
    const capacitador = await Capacitador.findOne({ where: { Correo } });
    if (!capacitador) {
      throw new Error('Credenciales inválidas');
    }

    // Si la contraseña en BD está hasheada, comparamos
    const stored = capacitador.toJSON();
    if (!stored.Contrasena) {
      throw new Error('Credenciales inválidas');
    }

    const bcrypt = require('bcrypt');
    const match = await bcrypt.compare(Contrasena, stored.Contrasena);
    if (!match) {
      throw new Error('Credenciales inválidas');
    }

    // Excluir la contraseña antes de devolver
    const { Contrasena: _, ...safe } = stored;
    return safe;
  } catch (error) {
    // Re-lanzamos errores para que el controlador decida el código HTTP
    throw error;
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
    // 1. Hashear la contraseña si se incluye en la actualización
    if (datosActualizados.Contrasena) {
        const hashedPassword = await bcrypt.hash(datosActualizados.Contrasena, SALT_ROUNDS);
        datosActualizados.Contrasena = hashedPassword;
    }

    // 2. Continúa con la lógica de actualización
    const [filasAfectadas] = await Capacitador.update(datosActualizados, {
      where: { ID_Capacitador: ID_Capacitador }
    });
    // ... (rest of update logic)
    
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
  autenticarCapacitador,
  crearCapacitador,
  obtenerCapacitadores,
  obtenerCapacitadorPorId,
  actualizarCapacitador,
  eliminarCapacitador
};