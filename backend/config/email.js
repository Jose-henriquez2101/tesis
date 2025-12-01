const nodemailer = require('nodemailer');

// Leer configuración desde variables de entorno por seguridad
const SMTP_SERVICE = process.env.SMTP_SERVICE || 'gmail';
const SMTP_USER = process.env.SMTP_USER || 'sistemaubbtesisrv@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || ''; // DEBE venir desde env var en producción

if (!SMTP_PASS) {
  console.warn('⚠️ SMTP_PASS no definido. Revisa .env o las variables de entorno para la cuenta de correo.');
}

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: SMTP_SERVICE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

// Verificar la conexión
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Error en la configuración de email:', error);
  } else {
    console.log('✅ Servidor de email listo para enviar mensajes (transporter verify)');
  }
});

module.exports = transporter;
