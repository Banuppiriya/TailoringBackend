// Updated controllers/adminController.js

import Service from '../models/Service.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
import sendEmail from '../utils/sendEmail.js';

// Create a new service (admin)
export const createService = async (req, res) => {
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
    res.status(500).json({ message: 'Failed to create service', error: error.message });
  }
};

// Update existing service
export const updateService = async (req, res) => {
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

    service.title = title || service.title;
    service.description = description || service.description;
    service.price = price || service.price;
    service.category = category || service.category;

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update service', error: error.message });
  }
};

// Delete a service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.imagePublicId) await deleteImage(service.imagePublicId);
    await service.deleteOne();

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete service', error: error.message });
  }
};

// Get all orders (admin)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'username email')
      .populate('tailor', 'username email')
      .populate('service', 'title price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Assign tailor to an order (admin)
export const assignTailor = async (req, res) => {
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
    res.status(500).json({ message: 'Failed to assign tailor', error: error.message });
  }
};

// Send payment request email to customer for an order (admin)
export const sendPaymentRequest = async (req, res) => {
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
    res.status(500).json({ message: 'Failed to send payment request', error: error.message });
  } 
};
