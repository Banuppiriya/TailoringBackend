const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/adminController'); // or wherever your controller is

// Service Routes
router.post('/services', serviceController.createService);
router.get('/services', serviceController.getServices);
router.put('/services/:id', serviceController.updateService);
router.delete('/services/:id', serviceController.deleteService);

// Order Routes
router.get('/orders', serviceController.getOrders);
router.post('/assign-tailor', serviceController.assignTailor);
router.post('/send-payment-request', serviceController.sendPaymentRequest);

module.exports = router;
