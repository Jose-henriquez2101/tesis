const express = require('express');
const router = express.Router();
const capacitadorController = require('../controllers/capacitadorController');

// Rutas base: /api/v1/capacitadores

// [C] Crear y [R] Obtener todos
router.post('/', capacitadorController.crearCapacitador);
router.get('/', capacitadorController.obtenerCapacitadores);

// [R] Obtener, [U] Actualizar y [D] Eliminar por ID
router.get('/:id', capacitadorController.obtenerCapacitador);
router.put('/:id', capacitadorController.actualizarCapacitador);
router.delete('/:id', capacitadorController.eliminarCapacitador);

module.exports = router;