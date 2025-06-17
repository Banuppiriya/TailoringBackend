const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const order = new Order({
      customer: req.user.id,
      service: serviceId,
      status: 'pending',
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
