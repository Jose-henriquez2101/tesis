const transporter = require('../config/email');
const crypto = require('crypto');

/**
 * Envía un email de recuperación de contraseña
 * @param {string} email - Correo del destinatario
 * @param {string} resetToken - Token de recuperación
 * @param {string} nombre - Nombre del capacitador
 * @returns {Promise} - Resultado del envío
 */
async function enviarEmailRecuperacion(email, resetToken, nombre) {
  // URL del frontend donde el usuario restablecerá su contraseña
  const resetUrl = `http://localhost:4200/restablecer-contrasena?token=${resetToken}`;

  const mailOptions = {
    from: '"Sistema UBB Tesis VR" <sistemaubbtesisrv@gmail.com>',
    to: email,
    subject: 'Recuperación de Contraseña - Sistema VR Bomberos',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Recuperación de Contraseña</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña en el Sistema de Entrenamiento VR para Bomberos.</p>
        <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #d32f2f; 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px;
                    display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p>O copia y pega el siguiente enlace en tu navegador:</p>
        <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">
          ${resetUrl}
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Este enlace expirará en 1 hora por razones de seguridad.
        </p>
        <p style="color: #666; font-size: 12px;">
          Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 11px; text-align: center;">
          Sistema de Entrenamiento VR - Universidad del Bío-Bío
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw new Error('No se pudo enviar el email de recuperación');
  }
}

/**
 * Envía un email de confirmación de cambio de contraseña
 * @param {string} email - Correo del destinatario
 * @param {string} nombre - Nombre del capacitador
 * @returns {Promise} - Resultado del envío
 */
async function enviarEmailConfirmacionCambio(email, nombre) {
  const mailOptions = {
    from: '"Sistema UBB Tesis VR" <sistemaubbtesisrv@gmail.com>',
    to: email,
    subject: 'Contraseña Actualizada - Sistema VR Bomberos',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2e7d32;">Contraseña Actualizada Exitosamente</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu contraseña ha sido actualizada exitosamente en el Sistema de Entrenamiento VR para Bomberos.</p>
        <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:4200/login" 
             style="background-color: #2e7d32; 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px;
                    display: inline-block;">
            Ir a Iniciar Sesión
          </a>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Si no realizaste este cambio, contacta inmediatamente al administrador del sistema.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 11px; text-align: center;">
          Sistema de Entrenamiento VR - Universidad del Bío-Bío
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmación enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email de confirmación:', error);
    // No lanzamos error aquí porque el cambio de contraseña ya se realizó
    return { success: false, error: error.message };
  }
}

/**
 * Genera un token aleatorio seguro
 * @returns {string} - Token hexadecimal
 */
function generarTokenRecuperacion() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  enviarEmailRecuperacion,
  enviarEmailConfirmacionCambio,
  generarTokenRecuperacion
};
