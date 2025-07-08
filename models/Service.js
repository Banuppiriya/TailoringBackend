import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Service description is required.'],
  },
  price: {
    type: Number,
    required: [true, 'Service price is required.'],
  },
  category: {
    type: String,
    enum: ['men', 'women', 'kids'],
    required: [true, 'Service category is required.'],
  },
  imageUrl: {
    type: String,
  },
  imagePublicId: {
    type: String,
  },
  features: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

export default mongoose.model('Service', serviceSchema);
