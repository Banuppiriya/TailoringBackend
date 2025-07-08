// src/models/order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'inProgress', 'completed', 'cancelled', 'delivered'],
    default: 'pending',
  },
  designDetails: {
    type: String,
  },
  // Embed measurements directly as subdocuments here
  measurements: {
    upperBody: {
      chest: { type: String, default: '' },
      shoulderWidth: { type: String, default: '' },
      armLength: { type: String, default: '' },
      bicep: { type: String, default: '' },
      neck: { type: String, default: '' },
    },
    lowerBody: {
      waist: { type: String, default: '' },
      hip: { type: String, default: '' },
      inseam: { type: String, default: '' },
      thigh: { type: String, default: '' },
      height: { type: String, default: '' },
    },
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  paymentIntentId: {
    type: String,
  },
  paymentRequestSent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Order', orderSchema);
