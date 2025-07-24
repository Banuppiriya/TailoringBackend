import Order from '../models/Order.js';
import User from '../models/User.js';

// Fetch orders for a user (authenticated or guest)
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email;
    const userPhone = req.user?.phone;

    if (!userId && !userEmail && !userPhone) {
      return res.status(401).json({ message: 'Not authorized: No user data in request' });
    }

    const orders = await Order.find({
      $or: [
        { customer: userId },
        { customerEmail: userEmail },
        { customerPhone: userPhone }
      ]
    })
      .populate('service', 'title price')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Fetch all tailors
export const getTailors = async (req, res) => {
  try {
    const tailors = await User.find({ role: 'tailor' }).select('-password');
    res.status(200).json(tailors);
  } catch (err) {
    console.error('Error fetching tailors:', err);
    res.status(500).json({ message: 'Error fetching tailors' });
  }
};
