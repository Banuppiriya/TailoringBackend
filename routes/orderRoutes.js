import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  assignTailor,
  sendPaymentRequest,
  updateOrderStatusByAdmin,
  updateOrderStatus,
  deleteOrder,
  getMyOrders,
  getMyAssignedOrders,
  resetOrderPayment,
  updateOrder
} from '../controllers/orderController.js';

import { protect } from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * Order Routes:
 * All routes are protected and role-based unless specified.
 */

// ✅ Create a new order (customer only)
router.post('/', protect, role('customer'), createOrder);

// ✅ Get all orders (admin only)
router.get('/', protect, role('admin'), getOrders);

// ✅ Get orders for the logged-in customer
router.get('/my-orders', protect, role('customer'), getMyOrders);

// ✅ Get assigned orders for the logged-in tailor
router.get('/assigned-orders', protect, role('tailor'), getMyAssignedOrders);

// ✅ Get order by ID (customer, tailor, or admin)
router.get('/:orderId', protect, getOrderById);

// ✅ Reset payment status (admin only)
router.post('/:orderId/reset-payment', protect, role('admin'), resetOrderPayment);

// ✅ Assign tailor to order (admin only)
router.put('/:orderId/assign-tailor', protect, role('admin'), assignTailor);

// ✅ Update entire order (admin or tailor)
router.put('/:orderId', protect, role('admin', 'tailor'), updateOrder);

// ✅ Admin updates order status (e.g., pending → processing → completed)
router.put('/:orderId/status', protect, role('admin'), updateOrderStatusByAdmin);

// ✅ Customer or tailor marks order as completed or cancelled
router.put('/:orderId/customer-status', protect, role(['customer', 'tailor']), updateOrderStatus);

// ✅ Simulate payment (customer)
router.post('/:orderId/pay', protect, role('customer'), sendPaymentRequest);

// ✅ Delete an order (admin only)
router.delete('/:orderId', protect, role('admin'), deleteOrder);

export default router;
