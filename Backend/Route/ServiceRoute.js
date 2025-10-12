const express = require('express');
const router = express.Router();
const ServiceController = require('../Controllers/ServiceController');
const authMiddleware = require('../middleware/authMiddleware');

// Assignment routes (place before parameterized routes)
router.get('/labor-workers', authMiddleware, ServiceController.getLaborWorkers);
router.get('/assigned', authMiddleware, ServiceController.getAssignedServices);
router.post('/assign', authMiddleware, ServiceController.assignService);

// GET all services
router.get('/', ServiceController.getServices);

// GET single service by ID
router.get('/:id', ServiceController.getServiceById);

// POST create a new service
router.post('/', ServiceController.createService);

// PUT update a service by ID
router.put('/:id', ServiceController.updateService);

// DELETE a service by ID
router.delete('/:id', ServiceController.deleteService);

module.exports = router;
