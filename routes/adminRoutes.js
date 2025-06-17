const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const adminController = require('../controllers/adminController');

// Protect all admin routes with authentication and admin role check
router.use(auth);
router.use(role('admin'));

// Admin - Service management routes
router.post('/services', upload.single('image'), adminController.createService);
router.put('/services/:id', upload.single('image'), adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// Admin - Order management routes
router.get('/orders', adminController.getOrders);
router.post('/orders/assign-tailor', adminController.assignTailor);
router.post('/orders/send-payment', adminController.sendPaymentRequest);

module.exports = router;
