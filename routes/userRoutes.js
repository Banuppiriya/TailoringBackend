import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.post('/orders', auth, userController.createOrder);

export default router;
