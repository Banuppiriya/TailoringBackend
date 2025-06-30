import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,  // This makes it mandatory
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'tailor', 'admin', 'customer'],
    default: 'user'
  },
  profileImage: { type: String },
  profileImagePublicId: { type: String },
  // other fields ...
});

export default mongoose.model('User', userSchema);
