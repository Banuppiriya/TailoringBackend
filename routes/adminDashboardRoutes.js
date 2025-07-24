import express from 'express';
import { getDashboardStats, getAllUsers } from '../controllers/adminDashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Debug logging for incoming requests
router.use((req, res, next) => {
  console.log('Admin Dashboard Request:', {
    path: req.path,
    method: req.method,
    headers: req.headers
  });
  next();
});

// Protect all admin routes with authentication and admin role check
router.use(protect);
router.use(role('admin'));

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get all users with pagination and filtering
router.get('/users', getAllUsers);

export default router;
