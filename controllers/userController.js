import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Get user profile with caching
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated'
      });
    }

    // Set cache headers for profile
    res.set('Cache-Control', 'private, max-age=300'); // Cache for 5 minutes

    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();  // Use lean() for better performance since we don't need a Mongoose document

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Return the user data without sensitive information
    const lastModified = user.updatedAt || user.createdAt || new Date();
    res.set('Last-Modified', lastModified.toUTCString());
    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        available: user.available,
        profilePicture: user.profilePicture,
        orders: user.orders || []
      }
    });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    // Check admin authorization
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized. Admin access required.' 
      });
    }

    // Get query parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const role = req.query.role; // Optional role filter
    const search = req.query.search; // Optional search term
    const sort = req.query.sort || '-createdAt'; // Default sort by newest first

    // Build query
    let query = {};
    
    // Add role filter if specified
    if (role && ['admin', 'tailor', 'customer'].includes(role)) {
      query.role = role;
    }

    // Add search if specified
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const total = await User.countDocuments(query);
    
    if (total === 0) {
      return res.status(200).json({
        success: true,
        data: {
          users: [],
          total: 0,
          page: 1,
          pages: 0,
          message: 'No users found matching the criteria'
        }
      });
    }

    const users = await User.find(query)
      .select('-password -__v')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort)
      .lean();

    // Send response
    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Get All Users Error:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.bio = req.body.bio || user.bio;

    if (req.body.profilePicture !== undefined) {
      console.log('Updating user.profilePicture to:', req.body.profilePicture);
      user.profilePicture = req.body.profilePicture;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    console.log('Saved user.profilePicture:', updatedUser.profilePicture);

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
};

// Get user's order history
export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
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
    if (!req.user || req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can place orders.' });
    }

    const { serviceId, quantity, designDetails } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required.' });
    }

    if (!quantity || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const order = new Order({
      customer: req.user.id,
      service: serviceId,
      quantity,
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

// Get all available tailors
export const getTailors = async (req, res) => {
  try {
    const tailors = await User.find({ role: 'tailor', available: true }).select('-password');
    res.status(200).json(tailors);
  } catch (error) {
    console.error('Get Tailors Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
