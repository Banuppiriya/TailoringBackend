const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: String,
  imagePublicId: String,  // for Cloudinary image delete
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);