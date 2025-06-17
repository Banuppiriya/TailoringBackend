const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  category: {
    type: String,
    enum: ['men', 'women', 'kids'],
    required: true
  },
  imageUrl: String,
  imagePublicId: String,
});

module.exports = mongoose.model('Service', serviceSchema);
