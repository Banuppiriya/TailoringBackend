import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return this.provider !== 'google';
    },
    select: false,
  },
  role: {
    type: String,
    enum: ['customer', 'tailor', 'admin'],
    default: 'customer',
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  // --- New field for profile picture ---
  profilePicture: {
    type: String,
    default: '', // Default to an empty string if no picture is set
  },
  // --- End new field ---
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {
  timestamps: true,
});

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User; // ✅ ES6 default export