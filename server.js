import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// ES module __dirname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// =================== Middleware ===================

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin', 
    'Accept',
    'Cache-Control',
    'If-Modified-Since',
    'If-None-Match'
  ],
  exposedHeaders: ['Last-Modified', 'ETag']
}));

app.use(helmet());
// Custom morgan format with response time
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
  skip: (req, res) => req.path === '/api/user/profile' && res.statusCode === 304
}));
app.use(cookieParser());

// For parsing JSON & URL encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================ Routes ================

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import tailorRoutes from './routes/tailorRoutes.js';
import measurementRoutes from './routes/measurementRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminPaymentRoutes from './routes/adminPaymentRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import userDashboardRoutes from './routes/userDashboardRoutes.js';
import customizerRoutes from './routes/customizerRoutes.js';
import uploadRoutes from './routes/upload.js';
import { handleWebhook } from './controllers/webhookController.js';

// Webhook route (must come before express.json())
app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Health check
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/tailor', tailorRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/dashboard', userDashboardRoutes);
app.use('/api/customizer', customizerRoutes);
app.use('/api/upload', uploadRoutes);

// ================ Error Handling ================
app.use((err, req, res, next) => {
  // Detailed error logging
  console.error('Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    headers: req.headers,
    body: req.body,
    user: req.user,
    mongoState: mongoose.connection.readyState
  });

  // Send detailed error response in development
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      mongoState: mongoose.connection.readyState,
      path: req.path,
      method: req.method
    } : undefined
  });

  // If this is a database connection error, attempt to reconnect
  if (mongoose.connection.readyState !== 1) {
    console.log('Attempting to reconnect to MongoDB...');
    connectDB();
  }
});

// ================ MongoDB Connection ================
mongoose.set('strictQuery', true);

const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    if (retries > 0) {
      console.warn(`Retrying MongoDB connection (${retries} left)...`);
      await new Promise((res) => setTimeout(res, 5000));
      return connectDB(retries - 1);
    }
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  await gracefulShutdown();
});
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await gracefulShutdown();
});

// ================ Start Server ================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
};

startServer();
