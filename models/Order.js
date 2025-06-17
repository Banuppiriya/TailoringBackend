const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  tailor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // assigned tailor
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  referenceImageUrl: String,
  referenceImagePublicId: String,
  paymentRequestSent: { type: Boolean, default: false }, // for admin tracking
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);