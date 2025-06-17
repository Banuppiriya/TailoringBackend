const Order = require('../models/Order');
const User = require('../models/User');
const Service = require('../models/Service');
const sendEmail = require('../utils/sendEmail');

// ✅ Get all orders (Admin)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'username email')
      .populate('tailor', 'username email')
      .populate('service', 'title price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Assign tailor to an order (Admin)
exports.assignTailor = async (req, res) => {
  try {
    const { orderId, tailorId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.tailor) {
      return res.status(400).json({ message: 'Tailor already assigned' });
    }

    const tailor = await User.findById(tailorId);
    if (!tailor || tailor.role !== 'tailor') {
      return res.status(400).json({ message: 'Invalid tailor' });
    }

    order.tailor = tailor._id;
    order.status = 'accepted';
    await order.save();

    res.json({ message: 'Tailor assigned successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Send payment request (Admin)
exports.sendPaymentRequest = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('customer', 'email username')
      .populate('service', 'title price');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.paymentRequestSent) {
      return res.status(400).json({ message: 'Payment request already sent' });
    }

    const subject = `Payment Request for Your Order #${order._id}`;
    const message = `
      <p>Dear ${order.customer.username},</p>
      <p>Please complete your payment of <strong>$${order.service.price}</strong> for the service "<strong>${order.service.title}</strong>".</p>
      <p>Thank you!</p>
    `;

    await sendEmail(order.customer.email, subject, message);

    order.paymentRequestSent = true;
    await order.save();

    res.json({ message: 'Payment request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
