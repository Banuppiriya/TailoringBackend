// controllers/adminController.js

const Service = require('../models/Service');
const Order = require('../models/Order');
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const sendEmail = require('../utils/sendEmail');

// Create a new service (admin)
exports.createService = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let image = {};

    if (req.file) {
      const uploaded = await uploadImage(req.file.path);
      image = { imageUrl: uploaded.secure_url, imagePublicId: uploaded.public_id };
    }

    const service = new Service({ title, description, price, category, ...image });
    await service.save();

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update existing service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category } = req.body;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (req.file) {
      if (service.imagePublicId) await deleteImage(service.imagePublicId);
      const uploaded = await uploadImage(req.file.path);
      service.imageUrl = uploaded.secure_url;
      service.imagePublicId = uploaded.public_id;
    }

    if (title) service.title = title;
    if (description) service.description = description;
    if (price) service.price = price;
    if (category) service.category = category;

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.imagePublicId) await deleteImage(service.imagePublicId);
    await service.remove();

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin)
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

// Assign tailor to an order (admin)
exports.assignTailor = async (req, res) => {
  try {
    const { orderId, tailorId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.tailor) return res.status(400).json({ message: 'Tailor already assigned' });

    const tailor = await User.findById(tailorId);
    if (!tailor || tailor.role !== 'tailor') return res.status(400).json({ message: 'Invalid tailor' });

    order.tailor = tailor._id;
    order.status = 'accepted';

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send payment request email to customer for an order (admin)
exports.sendPaymentRequest = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId)
      .populate('customer', 'email username')
      .populate('service', 'title price');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentRequestSent) return res.status(400).json({ message: 'Payment request already sent' });

    const subject = `Payment Request for Your Order #${order._id}`;
    const message = `
      <p>Dear ${order.customer.username},</p>
      <p>Please complete your payment of <strong>${order.service.price}</strong> for the service "<strong>${order.service.title}</strong>".</p>
      <p>Thank you for your business!</p>
    `;

    await sendEmail(order.customer.email, subject, message);

    order.paymentRequestSent = true;
    await order.save();

    res.json({ message: 'Payment request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
