import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  totalAmount: { type: Number, required: true }, // Total order amount
  paidAmount: { type: Number, required: true }, // Amount paid in this payment
  remainingAmount: { type: Number, required: true }, // Amount left to pay after this payment
  currency: { type: String, required: true, default: 'USD' },
  paymentIntentId: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['initial_pending', 'initial_paid', 'final_pending', 'completed'],
    default: 'initial_pending'
  },
  paymentType: {
    type: String,
    required: true,
    enum: ['initial', 'final'],
    default: 'initial'
  },
  createdAt: { type: Date, default: Date.now },
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
}, {
  timestamps: true, // adds createdAt and updatedAt automatically
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
