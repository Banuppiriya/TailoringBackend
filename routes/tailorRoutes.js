const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { getAssignedOrders, updateOrderStatus } = require('../controllers/tailorController');

router.use(authMiddleware);
router.use(roleMiddleware('tailor'));

router.get('/orders', getAssignedOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

module.exports = router;