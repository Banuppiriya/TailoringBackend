import express from 'express';
import {
  registerUser,
  loginUser,
  // Add other controllers if implemented
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Add other routes here if needed

export default router;
