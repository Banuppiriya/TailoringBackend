const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { getServices, placeOrder, getUserOrders } = require('../controllers/userController');

router.use(authMiddleware);
router.use(roleMiddleware('user'));

router.get('/services', getServices);
router.post('/orders', placeOrder);
router.get('/orders', getUserOrders);

module.exports = router;