import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { sendOrderNotification } from '../utils/email.js';

// 🔁 Helper to populate order details
const populateOrderDetails = (query) => {
  return query
    .populate('customer', 'username email')
    .populate('tailor', 'username')
    .populate('service', 'title price');
};

// ✅ Get all orders (Admin)
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();
    const orders = await populateOrderDetails(Order.find().skip(skip).limit(limit));
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

// ✅ Create order
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

    quantity = Number(quantity);
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

    const totalPrice = serviceDetails.price * quantity;

    const newOrder = new Order({
      customer: req.user ? req.user._id : null,
      customerName,
      customerEmail,
      customerPhone,
      service,
      quantity,
      specialInstructions,
      totalAmount: totalPrice, // Changed to match the model field name
      status: 'pending',
      paymentStatus: 'pending', // Changed to use correct enum value
    });

    const savedOrder = await newOrder.save();
    const populatedOrder = await populateOrderDetails(Order.findById(savedOrder._id));
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to create order.', error: err.message });
  }
};

// ✅ Assign tailor
export const assignTailor = async (req, res) => {
  const { orderId } = req.params;
  const { tailorId } = req.body;

  console.log('Assigning tailor:', { orderId, tailorId });

  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(tailorId)) {
    return res.status(400).json({ message: 'Invalid order or tailor ID.' });
  }

  let session;
  try {
    // Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.tailor) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order already assigned.' });
    }

    if (order.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order must be pending to assign a tailor.' });
    }

    const tailor = await User.findOne({ 
      _id: tailorId, 
      role: 'tailor',
      available: true  // Check if tailor is available
    }).session(session);

    if (!tailor) {
      await session.abortTransaction();
      return res.status(404).json({ 
        message: 'Tailor not found, is not available, or is not a tailor.' 
      });
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        $set: { 
          tailor: tailorId,
          status: 'in progress'
        }
      },
      { new: true, session }
    ).populate('tailor', 'username email');

    // Update tailor's availability
    await User.findByIdAndUpdate(
      tailorId,
      { $set: { available: false } },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();

    // Send notification if email exists
    if (order.customerEmail) {
      try {
        await sendOrderNotification(
          order.customerEmail,
          'Order Assigned',
          `Your order is now assigned to tailor ${tailor.username}.`
        );
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }

    // Get fully populated order for response
    const populatedOrder = await populateOrderDetails(Order.findById(orderId));
    res.status(200).json(populatedOrder);
  } catch (err) {
    console.error('Error assigning tailor:', {
      error: err.message,
      orderId,
      tailorId,
      stack: err.stack
    });

    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      }
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to assign tailor.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// ✅ Payment simulation
export const sendPaymentRequest = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.paymentStatus = 'completed';
    order.paidAmount = order.totalAmount;
    await order.save();

    res.status(200).json({ message: 'Payment successful.', order });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Payment failed.', error: err.message });
  }
};

// ✅ Admin updates status
export const updateOrderStatusByAdmin = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (status === 'completed' && order.tailor) {
      await mongoose.model('User').findByIdAndUpdate(order.tailor, { available: true });
    }

    const populatedOrder = await populateOrderDetails(Order.findById(order._id));
    res.status(200).json(populatedOrder);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: 'Update failed.', error: err.message });
  }
};

// ✅ Tailor/Customer updates status
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!['cancelled', 'completed'].includes(status)) {
    return res.status(403).json({ message: 'Not allowed to set this status.' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.status = status;
    await order.save();

    const populatedOrder = await populateOrderDetails(Order.findById(order._id));
    res.status(200).json(populatedOrder);
  } catch (err) {
    console.error('Status change error:', err);
    res.status(500).json({ message: 'Failed to update status.', error: err.message });
  }
};

// ✅ Generic update
export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const updates = req.body;

  try {
    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid order ID format'
      });
    }

    // Find the order first
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found'
      });
    }

    // Additional authorization checks
    if (req.user.role !== 'admin') {
      if (req.user.role === 'tailor' && order.tailor?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false,
          message: 'You can only update orders assigned to you'
        });
      }
    }

    // Validate status if it's being updated
    if (updates.status && !['pending', 'in progress', 'completed', 'cancelled'].includes(updates.status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid order status'
      });
    }

    // Update the order using transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update order
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { 
          ...updates, 
          lastUpdatedBy: req.user._id,
          updatedAt: new Date()
        },
        { 
          new: true,
          runValidators: true,
          session
        }
      )
      .populate('customer', 'username email')
      .populate('tailor', 'username')
      .populate('service', 'title price');

      // If status changed to completed and there's a tailor, update tailor availability
      if (updates.status === 'completed' && updatedOrder.tailor) {
        await User.findByIdAndUpdate(
          updatedOrder.tailor,
          { $set: { available: true } },
          { session }
        );
      }

      await session.commitTransaction();

      // Return formatted response
      res.status(200).json({
        success: true,
        message: `Order successfully updated to ${updates.status || 'new status'}`,
        data: {
          _id: updatedOrder._id,
          status: updatedOrder.status,
          customer: updatedOrder.customer,
          tailor: updatedOrder.tailor,
          service: updatedOrder.service,
          updatedAt: updatedOrder.updatedAt
        }
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error('Update error:', {
      orderId,
      userId: req.user._id,
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      success: false,
      message: 'Failed to update order',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ Delete order
export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    res.status(200).json({ message: 'Order deleted.' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Delete failed.', error: err.message });
  }
};

// ✅ Get current customer's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await populateOrderDetails(Order.find({ customer: req.user._id }));
    res.status(200).json(orders);
  } catch (err) {
    console.error('Customer order fetch error:', err);
    res.status(500).json({ message: 'Failed to get orders.' });
  }
};

// ✅ Get assigned orders for tailor
export const getMyAssignedOrders = async (req, res) => {
  try {
    const orders = await populateOrderDetails(Order.find({ tailor: req.user._id }));
    res.status(200).json(orders);
  } catch (err) {
    console.error('Tailor order fetch error:', err);
    res.status(500).json({ message: 'Failed to get assigned orders.' });
  }
};

// ✅ Reset payment status
export const resetOrderPayment = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.paymentStatus = 'pending';
    order.paidAmount = 0;
    await order.save();

    res.status(200).json({ message: 'Payment status reset to pending.', order });
  } catch (err) {
    console.error('Reset payment error:', err);
    res.status(500).json({ message: 'Failed to reset payment.', error: err.message });
  }
};

// All functions are already exported with their declarations
// No need for additional exports
