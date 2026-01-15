const express = require('express');
const router = express.Router();
const sesionController = require('../controllers/sesionController');
const uploadAudio = require('../middlewares/multerAudioConfig');

// Rutas base: /api/v1/sesiones
// [R] Obtener todas las sesiones (GET /api/v1/sesiones)
router.get('/', sesionController.obtenerTodasSesiones);

// Ruta de relación: Obtener sesiones de un bombero (GET /api/v1/sesiones/bomberos/:id)
// Debe ir antes de '/:id' para evitar conflicto de coincidencia de ruta
router.get('/bomberos/:id', sesionController.obtenerSesionesBombero);

// [C] Crear (POST)
router.post('/', sesionController.crearSesion);

// Ruta POST para que Angular inicie la simulación en Unity
router.post('/preparar-simulacion', sesionController.prepararSimulacion);

// Subir audio de una sesión (PUT /api/v1/sesiones/:id/audio)
router.put('/:id/audio', uploadAudio.single('audio'), sesionController.subirAudioSesion);

// [R] Leer - Obtener UNA sesión por ID (GET /api/v1/sesiones/123)
// Servir audio blob almacenado en BD (debe ir antes de '/:id' para evitar conflicto)
router.get('/:id/audio', sesionController.getAudioSesion);

// Obtener UNA sesión por ID
router.get('/:id', sesionController.obtenerSesion);

// [U] Actualizar - Actualizar UNA sesión por ID (PUT /api/v1/sesiones/123)
router.put('/:id', sesionController.actualizarSesion);

// [D] Eliminar - Eliminar UNA sesión por ID (DELETE /api/v1/sesiones/123)
router.delete('/:id', sesionController.eliminarSesion);

module.exports = router;