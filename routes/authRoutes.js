import express from 'express';
import {
  registerUser,
  login,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

// User registration route
router.post('/register', registerUser);

// User login route
router.post('/login', login);

// Password reset request route
router.post('/forgot-password', forgotPassword);

// Password reset submission route
router.post('/reset-password', resetPassword);

// Export the router to use in your app
export default router;
