import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

import connectDB from './config/db.js';

// Import routers
import authRoutes from './routes/authRoutes.js';
import tailorRoutes from './routes/tailorRoutes.js';
import userRoutes from './routes/userRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import measurementRoutes from './routes/measurementRoutes.js';
import customizerRoutes from './routes/customizerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/upload.js';
import { handleStripeWebhook } from './controllers/webhookController.js';




// __dirname workaround in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);


// Middleware to parse JSON bodies
app.use(express.json());

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration
const allowedOrigins = ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow REST tools like Postman
    if (!allowedOrigins.includes(origin)) {
      const msg = 'CORS policy does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/tailor', tailorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/customizer', customizerRoutes);
app.use('/api/upload', uploadRoutes);
// Blog articles API
import blogRoutes from './routes/blogRoutes.js';
app.use('/api/blog', blogRoutes);

// Optional: If you want to support `/api/profile` same as `/api/user`
app.use('/api/profile', userRoutes);

// Global error handler
const isDevelopment = process.env.NODE_ENV === 'development';
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (isDevelopment) {
    res.status(err.status || 500).json({
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.status || 500).json({ message: 'Server Error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
