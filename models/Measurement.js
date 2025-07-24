import mongoose from 'mongoose';

const measurementDetail = {
  type: Number,
  default: 0,
  min: 0,
};

const measurementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,  // only one measurement per user
  },
  upperBody: {
    chest: measurementDetail,
    shoulderWidth: measurementDetail,
    armLength: measurementDetail,
    bicep: measurementDetail,
    neck: measurementDetail,
  },
  lowerBody: {
    waist: measurementDetail,
    hip: measurementDetail,
    inseam: measurementDetail,
    thigh: measurementDetail,
    height: measurementDetail,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Measurement', measurementSchema);
