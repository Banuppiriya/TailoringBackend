const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const adminController = require('../controllers/adminController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // You can configure multer for your file storage needs

router.use(auth);
router.use(role('admin'));

// Service routes
router.post('/services', upload.single('image'), adminController.createService);
router.get('/services', adminController.getServices);
router.put('/services/:id', upload.single('image'), adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// Order routes
router.get('/orders', adminController.getOrders);
router.post('/orders/assign-tailor', adminController.assignTailor);
router.post('/orders/send-payment', adminController.sendPaymentRequest);

module.exports = router;