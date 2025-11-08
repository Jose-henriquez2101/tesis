const express = require('express');
const router = express.Router();
const escenarioController = require('../controllers/escenarioController');

// Rutas base: /api/v1/escenarios

// [C] Crear y [R] Obtener todos
router.post('/', escenarioController.crearEscenario);
router.get('/', escenarioController.obtenerEscenarios);

// [R] Obtener, [U] Actualizar y [D] Eliminar por ID
router.get('/:id', escenarioController.obtenerEscenario);
router.put('/:id', escenarioController.actualizarEscenario);
router.delete('/:id', escenarioController.eliminarEscenario);

module.exports = router;