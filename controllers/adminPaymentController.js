import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

/**
 * Fetch all payments, including related user and order details.
 */
export const getAllPayments = async (req, res) => {
  try {
    console.log('Fetching all payments...');

    // Verify admin authentication
    if (!req.user || req.user.role !== 'admin') {
      console.log('Unauthorized access attempt');
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection is not ready');
      return res.status(500).json({ message: 'Database connection error' });
    }

    const payments = await Payment.find()
      .populate({
        path: 'user',
        select: 'username email name',
      })
      .populate({
        path: 'order',
        populate: { path: 'service', select: 'name' },
      })
      .sort({ createdAt: -1 });

    if (payments.length === 0) {
      console.log('No payments found');
      return res.json([]);
    }

    console.log(`Found ${payments.length} payment(s)`);
    return res.json(payments);
  } catch (err) {
    console.error('Error in getAllPayments:', err);
    return res.status(500).json({
      message: 'Failed to fetch payments',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
};
