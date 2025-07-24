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
      required: false, // Optional
      trim: true,
    },
    customerEmail: {
      type: String,
      required: false, // Optional
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    customerPhone: {
      type: String,
      required: false, // Optional
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
      enum: ['pending', 'in progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'initial_paid', 'completed'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: function () {
        return this.totalAmount - this.paidAmount;
      },
    },
    tailor: {
      type: Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Sync remainingAmount before saving (in case paidAmount changes)
OrderSchema.pre('save', function (next) {
  this.remainingAmount = this.totalAmount - this.paidAmount;
  next();
});

const Order = model('Order', OrderSchema);
export default Order;
