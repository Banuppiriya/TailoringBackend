const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
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
    ref: 'User', // User with role 'tailor'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'inProgress', 'completed'],
    default: 'pending',
  },
  orderDetails: { type: String }, // extra instructions
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);