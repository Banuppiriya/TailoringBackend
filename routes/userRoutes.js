const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

router.post('/orders', auth, userController.createOrder);

module.exports = router;
