const jwt = require('jsonwebtoken');
const capacitadorService = require('../services/capacitadorService');
const emailService = require('../services/emailService');
const Capacitador = require('../models/Capacitador');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'TU_SECRETO_AQUI'; // poner en env var
const JWT_EXPIRES = 1000 * 60 * 60 * 2; // 2 horas en ms

async function loginCapacitador(req, res) {
  const { Correo, Contrasena } = req.body;
  try {
    const capacitador = await capacitadorService.autenticarCapacitador({ Correo, Contrasena });

    // Generar token (payload sin campos sensibles)
    const token = jwt.sign({
      id: capacitador.ID_Capacitador,
      nombre: capacitador.Nombre,
      correo: capacitador.Correo
    }, JWT_SECRET, { expiresIn: '2h' });

    // Enviar cookie HttpOnly
    // IMPORTANTE: secure debe coincidir con el valor usado en logout
    // secure: false porque no usamos HTTPS
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // false porque usamos HTTP (sin SSL)
      sameSite: 'lax',
      maxAge: JWT_EXPIRES,
      path: '/' // Asegurar que la cookie esté disponible en toda la aplicación
    });

    // Responder con datos seguros del capacitador (sin contraseña)
    return res.status(200).json({
      message: 'Autenticación exitosa',
      capacitador
    });
  } catch (error) {
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

// devuelve lo que traiga req.user (set por auth middleware)
function meCapacitador(req, res) {
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  return res.status(200).json(req.user);
}

function logoutCapacitador(req, res) {
  // Borra la cookie en el navegador
  // IMPORTANTE: Los atributos deben coincidir EXACTAMENTE con los del login
  // secure: false porque usamos HTTP (sin SSL)
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // false porque usamos HTTP (sin SSL)
    sameSite: 'lax',
    path: '/' // CRUCIAL: debe coincidir con el path del login
  });
  return res.status(200).json({ message: 'Logout exitoso' });
}

// Solicitar recuperación de contraseña
async function solicitarRecuperacionContrasena(req, res) {
  const { Correo } = req.body;

  try {
    // Buscar el capacitador por correo
    const capacitador = await Capacitador.findOne({ where: { Correo } });

    if (!capacitador) {
      // Por seguridad, no revelamos si el correo existe o no
      return res.status(200).json({
        message: 'Si el correo existe, recibirás un enlace de recuperación'
      });
    }

    // Generar token de recuperación
    const resetToken = emailService.generarTokenRecuperacion();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    capacitador.ResetToken = resetToken;
    capacitador.ResetTokenExpiry = resetTokenExpiry;
    await capacitador.save();

    // Enviar email
    await emailService.enviarEmailRecuperacion(
      capacitador.Correo,
      resetToken,
      capacitador.Nombre
    );

    return res.status(200).json({
      message: 'Si el correo existe, recibirás un enlace de recuperación'
    });
  } catch (error) {
    console.error('Error en solicitarRecuperacionContrasena:', error);
    return res.status(500).json({
      message: 'Error al procesar la solicitud de recuperación',
      error: error.message
    });
  }
}

// Restablecer contraseña con token
async function restablecerContrasena(req, res) {
  const { token, nuevaContrasena } = req.body;

  try {
    // Validar que se proporcionen los datos necesarios
    if (!token || !nuevaContrasena) {
      return res.status(400).json({
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    // Validar longitud de contraseña
    if (nuevaContrasena.length < 6) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar capacitador con el token válido
    const capacitador = await Capacitador.findOne({
      where: {
        ResetToken: token
      }
    });

    if (!capacitador) {
      return res.status(400).json({
        message: 'Token inválido o expirado'
      });
    }

    // Verificar que el token no haya expirado
    if (new Date() > new Date(capacitador.ResetTokenExpiry)) {
      return res.status(400).json({
        message: 'El token ha expirado. Solicita un nuevo enlace de recuperación'
      });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar contraseña y limpiar tokens
    capacitador.Contrasena = hashedPassword;
    capacitador.ResetToken = null;
    capacitador.ResetTokenExpiry = null;
    await capacitador.save();

    // Enviar email de confirmación
    await emailService.enviarEmailConfirmacionCambio(
      capacitador.Correo,
      capacitador.Nombre
    );

    return res.status(200).json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error en restablecerContrasena:', error);
    return res.status(500).json({
      message: 'Error al restablecer la contraseña',
      error: error.message
    });
  }
}

module.exports = {
  loginCapacitador,
  crearCapacitador,
  obtenerCapacitadores,
  obtenerCapacitador,
  actualizarCapacitador,
  eliminarCapacitador,
  meCapacitador,
  logoutCapacitador,
  solicitarRecuperacionContrasena,
  restablecerContrasena
};