import User from '../models/User.js';
import Order from '../models/Order.js';

// Helper to update user fields
const updateUserFields = (user, fields) => {
  for (const key in fields) {
    if (fields[key] !== undefined) {
      user[key] = fields[key];
    }
  }
};

// ADMIN: Get all tailors
export const getTailors = async (req, res) => {
  try {
    const tailors = await User.find({ role: 'tailor' }).select('-password');
    res.status(200).json(tailors);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ADMIN: Get single tailor by ID
export const getTailorById = async (req, res) => {
  try {
    const tailor = await User.findOne({ _id: req.params.id, role: 'tailor' }).select('-password');
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }
    res.status(200).json(tailor);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ADMIN: Update tailor details
export const updateTailor = async (req, res) => {
  try {
    const tailor = await User.findOne({ _id: req.params.id, role: 'tailor' });
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }
    updateUserFields(tailor, req.body);
    const updatedTailor = await tailor.save();
    res.status(200).json({ message: 'Tailor updated successfully.', tailor: updatedTailor });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ADMIN: Delete a tailor
export const deleteTailor = async (req, res) => {
  try {
    const tailor = await User.findOneAndDelete({ _id: req.params.id, role: 'tailor' });
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }
    res.status(200).json({ message: 'Tailor deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// TAILOR: Get own profile
export const getProfile = async (req, res) => {
  try {
    const tailor = await User.findById(req.user.id).select('-password');
    res.status(200).json(tailor);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// TAILOR: Update own profile
export const updateProfile = async (req, res) => {
  try {
    const tailor = await User.findById(req.user.id);
    updateUserFields(tailor, req.body);
    const updatedTailor = await tailor.save();
    res.status(200).json({ message: 'Profile updated successfully.', tailor: updatedTailor });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// TAILOR: Get assigned orders
export const getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ tailor: req.user.id })
      .populate('customer', 'username email')
      .populate('service', 'title');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// TAILOR: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, tailor: req.user.id },
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you.' });
    }
    res.status(200).json({ message: 'Order status updated.', order });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};
