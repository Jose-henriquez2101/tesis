const express = require('express');
const http = require('http');
const cors = require('cors');
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
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Permite la conexión desde cualquier origen (Angular, Unity)
    methods: ["GET", "POST"]
  }
});

// Almacenamos los clientes Unity conectados para enviar mensajes dirigidos
// Clave: ID Único de Unity (debe ser enviado por Unity). Valor: Socket.id
const unityClients = new Map();

// Hacer el objeto io y unityClients accesibles globalmente para los controladores
app.set('socketio', io);
app.set('unityClients', unityClients);

// Middleware
app.use(express.json()); // Permite a Express leer cuerpos JSON en las peticiones

//Cors desde cualquier origen
app.use(cors());

// Conectar a la base de datos
connectDB();

// --- Lógica de Socket.io ---
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  // Unity debe enviar un ID único al conectarse (ej. el ID de la estación VR)
  socket.on('register-unity', (unityId) => {
    unityClients.set(unityId, socket.id);
    console.log(`Unity cliente registrado con ID: ${unityId}. Clientes activos: ${unityClients.size}`);
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