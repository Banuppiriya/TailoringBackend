// models/Order.js
import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const OrderSchema = new Schema(
  {
    customer: {
      type: Types.ObjectId,
      ref: 'User',
      required: false, // Optional for guest checkouts
    },
    customerName: {
      type: String,
      required: false, // ✅ Now optional
      trim: true,
    },
    customerEmail: {
      type: String,
      required: false, // ✅ Now optional
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    customerPhone: {
      type: String,
      required: false, // ✅ Now optional
      trim: true,
    },
    service: {
      type: Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    specialInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    tailor: {
      type: Types.ObjectId,
      ref: 'User',
      required: false,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'pending'], // 🧹 Cleaned up
      default: 'unpaid',
    },
    totalPrice: {
      type: Number,
      required: false,
      min: [0, 'Price cannot be negative'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Order = model('Order', OrderSchema);
export default Order;
