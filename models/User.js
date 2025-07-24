import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Unique username
  },
  email: {
    type: String,
    required: true,
    unique: true, // Unique email
    lowercase: true,
    trim: true,
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  password: {
    type: String,
    required: function () {
      return this.provider === 'local'; // Password required only for local users
    },
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['customer', 'tailor', 'admin'],
    default: 'customer',
  },
  available: {
    type: Boolean,
    default: true, // Tailors are available by default
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  profilePicture: {
    type: String,
    default: '',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {
  timestamps: true,
});

// Hash password before saving, only if modified and local provider
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.provider !== 'local') return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to compare passwords
userSchema.methods.correctPassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create password reset token, hash it, set expiry, and return raw token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
