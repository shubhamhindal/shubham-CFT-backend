const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createService, listServices, deleteService, updateService } = require('../controllers/serviceController');

router.post('/category/:categoryId/service', auth, createService);
router.get('/category/:categoryId/services', auth, listServices);
router.delete('/category/:categoryId/service/:serviceId', auth, deleteService);
router.put('/category/:categoryId/service/:serviceId', auth, updateService);

module.exports = router;