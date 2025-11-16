const express = require('express');
const router = express.Router();
const capacitadorController = require('../controllers/capacitadorController');
const auth = require('../middlewares/auth');

// Rutas base: /api/v1/capacitadores

router.post('/login', capacitadorController.loginCapacitador);
router.post('/', auth,capacitadorController.crearCapacitador);
router.get('/', auth, capacitadorController.obtenerCapacitadores);
router.post('/logout', capacitadorController.logoutCapacitador); // opcional
router.get('/me', auth, capacitadorController.meCapacitador);   // nuevo endpoint protegido

router.get('/:id', auth, capacitadorController.obtenerCapacitador);
router.put('/:id', auth, capacitadorController.actualizarCapacitador);
router.delete('/:id', auth, capacitadorController.eliminarCapacitador);

module.exports = router;