import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  imagePublicId: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export default Service;
