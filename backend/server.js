const express = require('express');
const { connectDB } = require('./config/database');
const sesionRoutes = require('./routes/sesionRoutes'); 
const bomberoRoutes = require('./routes/bomberoRoutes');
const capacitadorRoutes = require('./routes/capacitadorRoutes');
const escenarioRoutes = require('./routes/escenarioRoutes');
require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Permite a Express leer cuerpos JSON en las peticiones

// Conectar a la base de datos
connectDB();

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
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});