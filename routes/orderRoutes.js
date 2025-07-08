// routes/orderRoutes.js

import express from 'express';
import Order from '../models/Order.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/order - fetch all orders
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('service')
      .populate('customer', 'username email')
      .populate('tailor', 'username email');
    res.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// GET /api/order/:id - fetch a single order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('service')
      .populate('customer', 'username email')
      .populate('tailor', 'username email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Failed to fetch order by ID:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// PUT /api/order/:id - assign tailor or update order
router.put('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update fields (e.g., assign tailor)
    const { tailor, status, service, price } = req.body;

    if (tailor) order.tailor = tailor;
    if (status) order.status = status;
    if (service) order.service = service;
    if (price) order.price = price;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
});

export default router;
