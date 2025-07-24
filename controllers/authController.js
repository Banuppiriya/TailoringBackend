// Import all dependencies at the top
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { OAuth2Client } from 'google-auth-library';
import mongoose from 'mongoose';

// Constants
const JWT_EXPIRES_IN = '7d';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ALLOWED_ROLES = ['customer', 'tailor', 'admin'];

// Generate JWT token for a user
const generateToken = (user) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is missing from environment');
    throw new Error('Server configuration error');
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Format user for response
const formatUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
});

// LOGIN USER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user);

    let redirectTo = '/services';
    if (user.role === 'admin') redirectTo = '/admin';
    else if (user.role === 'tailor') redirectTo = '/tailor';

    res.status(200).json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user),
      redirectTo,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      message: 'Login failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    email = email.trim().toLowerCase();
    role = ALLOWED_ROLES.includes(role) ? role : 'customer';

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'User already exists with this email.' });
    }

    if (await User.findOne({ username })) {
      return res.status(409).json({ message: 'Username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      provider: 'local',
      role,
    });

    await newUser.save();
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    if (!tokenId) {
      return res.status(400).json({ message: 'Token ID is required.' });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    let { email, name } = payload;
    email = email.trim().toLowerCase();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: name,
        email,
        password: '',
        provider: 'google',
        role: 'customer',
      });
      await user.save();
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Internal server error during Google login.' });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.
If you didn't request this, ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });

      res.status(200).json({
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Error sending email. Try again later!' });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required.' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user);
    res.status(200).json({
      message: 'Password reset successful.',
      token: jwtToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
