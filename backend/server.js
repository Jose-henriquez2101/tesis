const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Server } = require('socket.io');
const { connectDB } = require('./config/database');
const sesionRoutes = require('./routes/sesionRoutes'); 
const bomberoRoutes = require('./routes/bomberoRoutes');
const capacitadorRoutes = require('./routes/capacitadorRoutes');
const escenarioRoutes = require('./routes/escenarioRoutes');
require('./models');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Inicializar Socket.io
// Hacer el objeto io y unityClients accesibles globalmente para los controladores
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Permite la conexión desde cualquier origen (Angular, Unity)
    methods: ["GET", "POST"]
  }
});

// Almacenamos los clientes Unity conectados para enviar mensajes dirigidos
// Clave: ID Único de Unity (debe ser enviado por Unity). Valor: Socket.id
const unityClients = new Map();
app.set('unityClients', unityClients);

// Hacer el objeto io y unityClients accesibles globalmente para los controladores
app.set('socketio', io);
app.set('unityClients', unityClients);

// Middleware
app.use(express.json()); // Permite a Express leer cuerpos JSON en las peticiones
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets'))); //carpeta para las imagenes

app.use(cors({
  origin: [
    'http://localhost:4200',   // Angular local
    'http://pacheco.chillan.ubiobio.cl:8021', // Angular producción
    'http://localhost',        
    'http://127.0.0.1',
    'capacitor://localhost'
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Conectar a la base de datos
connectDB();

// --- Lógica de Socket.io ---
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  // UNITY: Registra su ID de estación VR
  socket.on('register-unity', (unityId) => {
    unityClients.set(unityId, socket.id);
    console.log(`Unity cliente registrado con ID: ${unityId}. Clientes activos: ${unityClients.size}`);
  });
  // UNITY: Notifica que ha presionado "Iniciar Simulación"
  socket.on('unity-ready', (unityId) => {
    // Paso intermedio: El Backend notifica a Angular que una estación Unity está lista.
    // Esto lo hacemos enviando a TODOS los clientes (incluido Angular)
    io.emit('select-bombero', { stationId: unityId }); 
    console.log(`Evento 'unity-ready' recibido de ${unityId}. Notificando a Angular.`);
  });

  // ANGULAR: Recibe el evento de Unity, el Capacitador selecciona y envía la decisión
  // NOTA: Este evento lo debe enviar el Panel Angular (el Cliente Capacitador).
  socket.on('start-vr-session', (data) => {
    const { stationId, idBombero, idEscenario } = data;
    console.log(`Petición de Angular: Iniciar Escenario ID ${idEscenario} para Bombero ${idBombero} en Estación ${stationId}`);

    const targetSocketId = unityClients.get(stationId);

    if (targetSocketId) {
      // ENVIAR SOLAMENTE EL ID DE ESCENARIO
      io.to(targetSocketId).emit('load-scenario', idEscenario); // <--- CAMBIO CLAVE
      console.log(`Comando de carga de Escenario ID ${idEscenario} enviado a Unity: ${stationId}`);
    } else {
      console.error(`Error: Estación Unity ${stationId} no encontrada para envío dirigido.`);
      // Opcional: Notificar a Angular que el envío falló
      socket.emit('session-error', { message: `Estación ${stationId} no está conectada.` });
    }
  });

  socket.on('disconnect', () => {
    // Limpiar el cliente Unity si se desconecta
    for (let [unityId, socketId] of unityClients.entries()) {
      if (socketId === socket.id) {
        unityClients.delete(unityId);
        console.log(`Unity cliente desregistrado: ${unityId}. Restantes: ${unityClients.size}`);
        break;
      }
    }
  });
});
// --------------------------

// --- Conexión de Rutas ---
// Todas las rutas de sesiones comenzarán con /api/v1/sesiones
app.use('/api/v1/sesiones', sesionRoutes); 
app.use('/api/v1/bomberos', bomberoRoutes);
app.use('/api/v1/capacitadores', capacitadorRoutes);
app.use('/api/v1/escenarios', escenarioRoutes);
// --------------------------

// Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: "API de Backend para el proyecto VR de Bomberos - Online",
    status: "ok"
  });
});

// Iniciar el servidor
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});