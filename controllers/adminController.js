const Service = require('../models/Service');
const Order = require('../models/Order');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // or use memoryStorage/cloudinary config


exports.createService = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    let image;

    if (req.file) {
      const uploaded = await uploadImage(req.file.path);
      image = { imageUrl: uploaded.secure_url, imagePublicId: uploaded.public_id };
    }

    const service = new Service({ title, description, price, ...image });
    await service.save();

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (req.file) {
      if (service.imagePublicId) {
        await deleteImage(service.imagePublicId);
      }
      const uploaded = await uploadImage(req.file.path);
      service.imageUrl = uploaded.secure_url;
      service.imagePublicId = uploaded.public_id;
    }

    if (title) service.title = title;
    if (description) service.description = description;
    if (price) service.price = price;

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.imagePublicId) await deleteImage(service.imagePublicId);
    await service.remove();

    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('tailor', 'name email')
      .populate('service', 'title price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

exports.sendPaymentRequest = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('customer', 'email name service');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentRequestSent) return res.status(400).json({ message: 'Payment request already sent' });

    const subject = `Payment Request for Your Order #${order._id}`;
    const message = `
      <p>Dear ${order.customer.name},</p>
      <p>Please complete your payment of <strong>${order.service.price}</strong> for the service "<strong>${order.service.title}</strong>".</p>
      <p>Thank you!</p>
    `;

    await sendEmail(order.customer.email, subject, message);

    order.paymentRequestSent = true;
    await order.save();

    res.json({ message: 'Payment request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};