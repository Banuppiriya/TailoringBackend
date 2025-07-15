import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Service from '../models/Service.js';

// 🔁 Helper to populate order details
const populateOrderDetails = (query) => {
  return query
    .populate('customer', 'username email')
    .populate('tailor', 'username')
    .populate('service', 'title price');
};

// ✅ Get all orders
export const getOrders = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();
    const orders = await populateOrderDetails(
      Order.find().skip(skip).limit(limit)
    );
    res.status(200).json({ orders, total });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error while fetching orders.' });
  }
};

// ✅ Get order by ID
export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID format.' });
  }

  try {
    const order = await populateOrderDetails(Order.findById(orderId));

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Server error while fetching order.' });
  }
};

// ✅ Create new order (updated with quantity validation)
export const createOrder = async (req, res) => {
  try {
    let {
      service,
      quantity,
      specialInstructions,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    quantity = Number(quantity); // Convert quantity to number explicitly

    if (!service || !mongoose.Types.ObjectId.isValid(service)) {
      return res.status(400).json({ message: 'Service ID is required and must be valid.' });
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    const serviceDetails = await Service.findById(service);
    if (!serviceDetails) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    if (typeof serviceDetails.price !== 'number' || isNaN(serviceDetails.price)) {
      return res.status(400).json({ message: 'Service price is invalid.' });
    }

    const totalPrice = serviceDetails.price * quantity;

    const newOrder = new Order({
      customer: req.user ? req.user._id : null,
      customerName,
      customerEmail,
      customerPhone,
      service,
      quantity,
      specialInstructions,
      totalPrice,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    const savedOrder = await newOrder.save();
    const populatedOrder = await populateOrderDetails(Order.findById(savedOrder._id));
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to create order.', error: err.message });
  }
};

// ✅ Assign tailor to order
export const assignTailor = async (req, res) => {
  const { orderId } = req.params;
  const { tailorId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(tailorId)) {
    return res.status(400).json({ message: 'Invalid order ID or tailor ID.' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check tailor availability
    const tailor = await mongoose.model('User').findOne({ _id: tailorId, role: 'tailor' });
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }
    if (!tailor.available) {
      return res.status(400).json({ message: 'Tailor is not available.' });
    }


    order.tailor = tailorId;
    // Set status to 'accepted' if currently pending
    if (order.status === 'pending') {
      order.status = 'accepted';
    }
    await order.save();

    // Set tailor as unavailable
    tailor.available = false;
    await tailor.save();

    const populatedOrder = await Order.findById(orderId)
      .populate('customer', 'username email')
      .populate('tailor', 'username')
      .populate('service', 'title price');

    res.status(200).json(populatedOrder);
  } catch (err) {
    console.error('Error assigning tailor:', err);
    res.status(500).json({ message: 'Failed to assign tailor.', error: err.message });
  }
};

// ✅ Send payment request (stub logic)
export const sendPaymentRequest = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.paymentStatus = 'paid'; // Simulated
    await order.save();

    res.status(200).json({ message: 'Payment request sent successfully.', orderId });
  } catch (err) {
    console.error('Error sending payment request:', err);
    res.status(500).json({ message: 'Failed to send payment request.', error: err.message });
  }
};

// ✅ Admin update order status
export const updateOrderStatusByAdmin = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID format.' });
  }

  if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // If order is completed, set tailor as available
    if (status === 'completed' && order.tailor) {
      await mongoose.model('User').findByIdAndUpdate(order.tailor, { available: true });
    }

    const populatedOrder = await populateOrderDetails(Order.findById(order._id));
    res.status(200).json(populatedOrder);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(400).json({ message: 'Failed to update status.', error: err.message });
  }
};

// ✅ Customer/Tailor: limited status update
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID format.' });
  }

  const allowedStatuses = ['cancelled', 'completed'];
  if (!allowedStatuses.includes(status)) {
    return res.status(403).json({ message: 'Not allowed to set this status.' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    await order.save();

    const populatedOrder = await populateOrderDetails(Order.findById(order._id));
    res.status(200).json(populatedOrder);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(400).json({ message: 'Failed to update order status.', error: err.message });
  }
};

// ✅ Generic update order (admin/tailor)
export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID format.' });
  }
  try {
    const order = await Order.findByIdAndUpdate(orderId, req.body, { new: true })
      .populate('customer', 'username email')
      .populate('tailor', 'username')
      .populate('service', 'title price');
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ message: 'Server error updating order.' });
  }
};
// ✅ Delete order (Admin)
export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID format.' });
  }

  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ message: 'Failed to delete order.', error: err.message });
  }
};

// ✅ Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const orders = await populateOrderDetails(Order.find({ customer: req.user._id }));
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    res.status(500).json({ message: 'Failed to get your orders.' });
  }
};

// ✅ Get tailor's assigned orders
export const getMyAssignedOrders = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const orders = await populateOrderDetails(Order.find({ tailor: req.user._id }));
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching assigned orders:', err);
    res.status(500).json({ message: 'Failed to get assigned orders.' });
  }
};
