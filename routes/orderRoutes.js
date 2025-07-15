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
} from '../controllers/orderController.js';

const router = express.Router();

// ✅ Create a new order
router.post('/', createOrder);

// ✅ Get all orders (admin or general)
router.get('/', getOrders);

// ✅ Get current logged-in customer's orders
router.get('/my-orders', getMyOrders);

// ✅ Get orders assigned to the logged-in tailor
router.get('/assigned-orders', getMyAssignedOrders);

// ✅ Get a specific order by ID
router.get('/:orderId', getOrderById);

// ✅ Assign a tailor to an order (admin)
router.put('/:orderId/assign-tailor', assignTailor);

// ✅ Generic update order (admin/tailor)
import { updateOrder } from '../controllers/orderController.js';
router.put('/:orderId', updateOrder);

// ✅ Admin updates order status (pending → processing → completed)
router.put('/:orderId/status', updateOrderStatusByAdmin);

// ✅ Customer or tailor updates status (cancelled/completed)
router.put('/:orderId/customer-status', updateOrderStatus);

// ✅ Simulate payment processing
router.post('/:orderId/pay', sendPaymentRequest);



// ✅ Delete an order (admin only)
router.delete('/:orderId', deleteOrder);

export default router;
