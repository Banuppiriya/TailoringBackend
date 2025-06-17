const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

// Auth required for all
router.use(auth);

// Admin only
router.get('/admin', role(['admin']), orderController.getAllOrders);
router.post('/assign-tailor', role(['admin']), orderController.assignTailor);
router.post('/send-payment', role(['admin']), orderController.sendPaymentRequest);

// Customer
router.get('/my-orders', role(['customer']), orderController.getCustomerOrders);

// Tailor
router.get('/tailor-orders', role(['tailor']), orderController.getTailorOrders);
router.put('/tailor-orders/:orderId', role(['tailor']), orderController.updateOrderStatus);

module.exports = router;
