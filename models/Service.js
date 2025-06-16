const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },  
  description: { type: String },
  price: { type: Number, required: true },
});

module.exports = mongoose.model('Service', serviceSchema);