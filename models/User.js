import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true, // unique username
  },
  email: {
    type: String,
    required: true,
    unique: true, // unique email
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      return this.provider === 'local';
    },
    select: false,
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.provider !== 'local') return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
