// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
import Order from '../models/Order.js';
import User from '../models/User.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.bio = req.body.bio || user.bio;

      if (req.body.profilePicture !== undefined) {
        user.profilePicture = req.body.profilePicture;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
};

// Get user's order history
export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('service', 'title price')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Get Order History Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    // Only allow customers to place orders
    if (!req.user || req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can place orders.' });
    }

    const { serviceId, designDetails } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required.' });
    }

    const order = new Order({
      customer: req.user.id,
      service: serviceId,
      status: 'pending',
      designDetails,
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully.', order });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get all tailors
export const getTailors = async (req, res) => {
  try {
    // Only return tailors who are available
    const tailors = await User.find({ role: 'tailor', available: true }).select('-password');
    res.status(200).json(tailors);
  } catch (error) {
    console.error('Get Tailors Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
