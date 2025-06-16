const Order = require('../models/Order');

exports.getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ tailor: req.user._id })
      .populate('user', 'username email')
      .populate('service', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // Only allow 'inProgress' or 'completed'

  if (!['inProgress', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status update' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};