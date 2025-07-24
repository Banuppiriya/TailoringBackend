import User from '../models/User.js';
import Order from '../models/Order.js';
import Service from '../models/Service.js';
import Payment from '../models/Payment.js';

export const getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users...');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';

    // Build query
    const query = { role: { $ne: 'admin' } };
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      query.role = role;
    }

    // Execute query with pagination
    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      users,
      pagination: {
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    
    const [
      totalUsers,
      totalOrders,
      totalServices,
      payments,
      recentOrders,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } })
        .catch(err => {
          console.error('Error counting users:', err);
          return 0;
        }),
      Order.countDocuments()
        .catch(err => {
          console.error('Error counting orders:', err);
          return 0;
        }),
      Service.countDocuments()
        .catch(err => {
          console.error('Error counting services:', err);
          return 0;
        }),
      Payment.find()
        .select('paidAmount totalAmount status')
        .catch(err => {
          console.error('Error fetching payments:', err);
          return [];
        }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'username')
        .lean()
        .catch(err => {
          console.error('Error fetching recent orders:', err);
          return [];
        }),
      User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username email createdAt')
        .lean()
        .catch(err => {
          console.error('Error fetching recent users:', err);
          return [];
        })
    ]);

    console.log('Calculating total revenue from payments:', payments);
    const totalRevenue = payments.reduce((sum, payment) => {
      // Only count completed or paid payments
      if (payment.status === 'completed' || payment.status === 'initial_paid') {
        return sum + (payment.paidAmount || payment.totalAmount || 0);
      }
      return sum;
    }, 0);

    console.log('Processing recent orders...');
    // Process recent orders to include customer name
    const processedRecentOrders = recentOrders.map(order => {
      try {
        return {
          _id: order._id,
          customerName: order.customer?.username || order.customerName || 'Anonymous',
          status: order.status || 'pending',
          amount: order.totalAmount || 0
        };
      } catch (err) {
        console.error('Error processing order:', err);
        return null;
      }
    }).filter(Boolean); // Remove any null entries

    console.log('Preparing response...');
    res.json({
      totalUsers,
      totalOrders,
      totalServices,
      totalRevenue,
      recentOrders: processedRecentOrders,
      recentUsers
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    // Send more detailed error information in development
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ 
        message: 'Error fetching dashboard statistics',
        error: error.message,
        stack: error.stack 
      });
    } else {
      res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
  }
};
