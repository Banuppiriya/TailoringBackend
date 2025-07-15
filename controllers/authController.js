import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { OAuth2Client } from 'google-auth-library';

// --- JWT Secret validation (fail fast if missing) ---
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables (authController.js)');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
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

const ALLOWED_ROLES = ['customer', 'tailor', 'admin'];

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    email = email.trim().toLowerCase();

    // Validate role
    if (!role || !ALLOWED_ROLES.includes(role)) {
      role = 'customer'; // default role
    }

    // Check if email or username already exists
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'User already exists with this email.' });
    }
    if (await User.findOne({ username })) {
      return res.status(409).json({ message: 'Username is already taken.' });
    }

    


    const newUser = new User({
      username,
      email,
      password,
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

// LOGIN USER
// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.provider === 'google') {
      return res.status(403).json({ message: 'Please log in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user);

    // ✅ Determine redirect path based on role
    let redirectTo = '/';
    if (user.role === 'admin') {
      redirectTo = '/admin';
    } else if (user.role === 'tailor') {
      redirectTo = '/tailor';
    } else {
      redirectTo = '/user';
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user),
      redirectTo, // ✅ send target path
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
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
        password: '', // No password for Google users
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
    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });

      res.status(200).json({
        status: 'success',
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
    if (!req.params.token) {
      return res.status(400).json({ message: 'Reset token is required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    if (!req.body.password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      message: 'Password reset successful.',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

