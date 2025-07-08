// controllers/orderController.js
import Order from '../models/Order.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// Helper function to find order by ID and populate necessary fields
const findOrderById = async (id, res) => {
  try {
    const order = await Order.findById(id)
      .populate('customer', 'username email')
      .populate('tailor', 'username')
      .populate('service', 'title price');
    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return null;
    }
    return order;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
    return null;
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  const order = await findOrderById(req.params.orderId, res);
  if (!order) return;
  res.status(200).json(order);
};

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'username email')
      .populate('tailor', 'username')
      .populate('service', 'title price')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Assign tailor to order
export const assignTailor = async (req, res) => {
  try {
    const { orderId, tailorId } = req.body;
    const order = await findOrderById(orderId, res);
    if (!order) return;

    if (order.tailor) {
      return res.status(400).json({ message: 'Tailor already assigned to this order.' });
    }

    const tailor = await User.findOne({ _id: tailorId, role: 'tailor' });
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }

    order.tailor = tailor._id;
    order.status = 'inProgress';
    await order.save();

    res.status(200).json({ message: 'Tailor assigned successfully.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Send payment request email
export const sendPaymentRequest = async (req, res) => {
  try {
    const order = await findOrderById(req.params.orderId, res);
    if (!order) return;

    if (order.paymentRequestSent) {
      return res.status(400).json({ message: 'Payment request has already been sent.' });
    }

    const subject = `Payment Request for Your Order #${order._id}`;
    const message = `<p>Dear ${order.customer.username},</p>
      <p>Please complete your payment of <strong>$${order.service.price}</strong> for the service "<strong>${order.service.title}</strong>".</p>
      <p>Thank you!</p>`;

    await sendEmail({ to: order.customer.email, subject, html: message });

    order.paymentRequestSent = true;
    await order.save();

    res.status(200).json({ message: 'Payment request sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { service, designDetails, measurements } = req.body;
    const customer = req.user.id;

    if (!service) {
      return res.status(400).json({ message: 'Service is required.' });
    }

    const newOrder = new Order({
      customer,
      service,
      designDetails,
      measurements,
      status: 'pending',
      paymentStatus: 'pending',
    });

    const savedOrder = await newOrder.save();
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('customer', 'username email')
      .populate('service', 'title price');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error during order creation.' });
  }
};

// Admin updates order status
export const updateOrderStatusByAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    )
      .populate('customer', 'username email')
      .populate('tailor', 'username')
      .populate('service', 'title price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Order status updated by admin.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get orders for logged-in customer
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('tailor', 'username')
      .populate('service', 'title price')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get orders assigned to logged-in tailor
export const getMyAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ tailor: req.user.id })
      .populate('customer', 'username email')
      .populate('service', 'title price')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Tailor updates order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, tailor: req.user.id },
      { status },
      { new: true }
    )
      .populate('customer', 'username email')
      .populate('tailor', 'username')
      .populate('service', 'title price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you.' });
    }

    res.status(200).json({ message: 'Order status updated.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
