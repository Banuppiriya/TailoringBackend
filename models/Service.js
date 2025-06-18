const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  imageUrl: String,
  imagePublicId: String,
  category: {
    type: String,
    enum: ['women', 'kids', 'unisex'], // <-- example
    required: true,
  },

});

module.exports = mongoose.model('Service', serviceSchema);
