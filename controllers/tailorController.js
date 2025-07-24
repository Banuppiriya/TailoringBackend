import User from '../models/User.js';
import Order from '../models/Order.js';

// Helper: Update user fields dynamically
const updateUserFields = (user, fields) => {
  for (const key in fields) {
    if (fields[key] !== undefined) {
      user[key] = fields[key];
    }
  }
};

/* ------------------------- TAILOR: Self Profile ------------------------- */

// GET /api/tailors/profile
export const getProfile = async (req, res) => {
  try {
    const tailor = await User.findById(req.user.id)
      .select('-password')
      .populate('services', 'title description price');

    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found' });
    }

    res.status(200).json(tailor);
  } catch (error) {
    console.error('Get Tailor Profile Error:', error);
    res.status(500).json({ message: 'Error retrieving tailor profile' });
  }
};

// PUT /api/tailors/profile
export const updateProfile = async (req, res) => {
  try {
    const tailor = await User.findById(req.user.id);
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found' });
    }

    updateUserFields(tailor, req.body);
    const updatedTailor = await tailor.save();

    res.status(200).json({ message: 'Profile updated successfully.', tailor: updatedTailor });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// GET /api/tailor/available
export const getAvailableTailors = async (req, res) => {
  try {
    const availableTailors = await User.find({
      role: 'tailor',
      available: true,
      isActive: true
    }).select('-password');

    res.status(200).json({
      success: true,
      count: availableTailors.length,
      tailors: availableTailors
    });
  } catch (error) {
    console.error('Get Available Tailors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving available tailors',
      error: error.message
    });
  }
};

// PUT /api/tailor/:id/toggle-availability
export const toggleAvailability = async (req, res) => {
  try {
    const tailor = await User.findById(req.params.id);
    
    if (!tailor) {
      return res.status(404).json({
        success: false,
        message: 'Tailor not found'
      });
    }

    // Toggle the availability
    tailor.available = !tailor.available;
    await tailor.save();

    res.status(200).json({
      success: true,
      message: `Tailor availability set to ${tailor.available}`,
      tailor: {
        id: tailor._id,
        available: tailor.available
      }
    });
  } catch (error) {
    console.error('Toggle Availability Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tailor availability',
      error: error.message
    });
  }
};

// GET /api/tailors/assigned-services
export const getAssignedServices = async (req, res) => {
  try {
    const orders = await Order.find({ tailor: req.user.id })
      .populate('service', 'title description price');

    const serviceMap = new Map();
    orders.forEach(order => {
      if (order.service?._id) {
        serviceMap.set(order.service._id.toString(), order.service);
      }
    });

    const services = Array.from(serviceMap.values());
    res.status(200).json({ services });
  } catch (error) {
    console.error('Get Assigned Services Error:', error);
    res.status(500).json({ message: 'Error retrieving assigned services' });
  }
};

// GET /api/tailors/assigned-orders
export const getAssignedOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({ tailor: req.user.id });
    const orders = await Order.find({ tailor: req.user.id })
      .populate({ path: 'customer', select: 'username email', strictPopulate: false })
      .populate({ path: 'service', select: 'title', strictPopulate: false })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ orders, total });
  } catch (error) {
    console.error('Error in getAssignedOrders:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PATCH /api/tailors/orders/:orderId/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, tailor: req.user.id },
      { status },
      { new: true }
    ).populate('customer', 'email username');

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you.' });
    }

    // Prepare email notification
    const name = order.customer?.username || order.customerName || 'Customer';
    const to = order.customer?.email || order.customerEmail;
    let subject = 'Order status updated';
    let text = `Dear ${name},\n\nYour order (${order._id}) status is now: ${status}.`;

    if (status === 'processing') {
      subject = 'Your order has been picked up!';
      text = `Dear ${name},\n\nYour order (${order._id}) is now being processed.`;
    } else if (status === 'completed') {
      subject = 'Your order is completed!';
      text = `Dear ${name},\n\nYour order (${order._id}) has been completed.`;
    }

    // Send email if available
    if (to) {
      const { sendOrderNotification } = await import('../utils/email.js');
      await sendOrderNotification(to, subject, text);
    }

    res.status(200).json({ message: 'Order status updated.', order });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/* --------------------------- ADMIN: Tailor CRUD -------------------------- */

// GET /api/admin/tailors
export const getTailors = async (req, res) => {
  try {
    const tailors = await User.find({ role: 'tailor' }).select('-password');
    res.status(200).json({ tailors });
  } catch (error) {
    console.error('Get Tailors Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// GET /api/admin/tailors/:id
export const getTailorById = async (req, res) => {
  try {
    const tailor = await User.findOne({ _id: req.params.id, role: 'tailor' }).select('-password');
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }
    res.status(200).json(tailor);
  } catch (error) {
    console.error('Get Tailor By ID Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PUT /api/admin/tailors/:id
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
    console.error('Update Tailor Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// DELETE /api/admin/tailors/:id
export const deleteTailor = async (req, res) => {
  try {
    const tailor = await User.findOneAndDelete({ _id: req.params.id, role: 'tailor' });
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }
    res.status(200).json({ message: 'Tailor deleted successfully.' });
  } catch (error) {
    console.error('Delete Tailor Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
