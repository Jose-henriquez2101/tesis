const nodemailer = require('nodemailer');

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemaubbtesisrv@gmail.com',
    pass: 'sxtx udly wvxi pktq' // App Password de Gmail
  }
});

// Verificar la conexión
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Error en la configuración de email:', error);
  } else {
    console.log('✅ Servidor de email listo para enviar mensajes');
  }
});

module.exports = transporter;
