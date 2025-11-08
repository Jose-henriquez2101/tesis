const express = require('express');
const router = express.Router();
const bomberoController = require('../controllers/bomberoController');

// Rutas base: /api/v1/bomberos

// [C] Crear un nuevo bombero
router.post('/', bomberoController.crearBombero);

// [R] Obtener todos los bomberos
router.get('/', bomberoController.obtenerBomberos);

// [R] Obtener, [U] Actualizar y [D] Eliminar un bombero por ID
router.get('/:id', bomberoController.obtenerBombero);
router.put('/:id', bomberoController.actualizarBombero);
router.delete('/:id', bomberoController.eliminarBombero);


module.exports = router;