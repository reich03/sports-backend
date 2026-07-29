const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const { uploadDriverPhoto } = require('../middlewares/upload.middleware');

router.get('/', driverController.getAllDrivers);
router.get('/:driverId', driverController.getDriverById);

router.post('/', authenticateJWT, isAdmin, driverController.createDriver);
router.put('/:driverId', authenticateJWT, isAdmin, driverController.updateDriver);
router.delete('/:driverId', authenticateJWT, isAdmin, driverController.deleteDriver);

router.post('/:driverId/photo', authenticateJWT, isAdmin, uploadDriverPhoto.single('photo'), driverController.uploadDriverPhoto);
router.delete('/:driverId/photo', authenticateJWT, isAdmin, driverController.deleteDriverPhoto);

module.exports = router;
