const express = require('express');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Permite a Express leer cuerpos JSON en las peticiones

// Conectar a la base de datos
connectDB();

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