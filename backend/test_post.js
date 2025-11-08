const http = require('http');

const data = JSON.stringify({
  Duracion: '00:05:30',
  Fecha: '2025-11-06T15:00:00Z',
  Audio_Sesion: 'ruta/al/audio/sesion_1.mp3',
  ID_Capacitador_FK: 3,
  ID_Bombero_FK: 2,
  ID_Escenario_FK: 1
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/sesiones',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  let body = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log('BODY:', body); });
});

req.on('error', (e) => {
  console.error('problem with request:', e.message);
});

req.write(data);
req.end();
