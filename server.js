// ES6 module version

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import cors from 'cors';

// Import routers
import authRoutes from './routes/authRoutes.js';
import tailorRoutes from './routes/tailorRoutes.js';
import userRoutes from './routes/userRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import orderRoutes from './routes/orderRoutes.js'; // <-- fixed import name
import measurementRoutes from './routes/measurementRoutes.js';
import customizerRoutes from './routes/customizerRoutes.js';

// __dirname workaround in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect DB
connectDB();

const app = express();
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const allowedOrigins = ['http://localhost:5173' // Add your frontend URLs here
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies to be sent
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tailor', tailorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orderRoutes', orderRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/customizer', customizerRoutes);
app.use('/api/profile', userRoutes); // Assuming profile routes are under userRoutes

const isDevelopment = process.env.NODE_ENV === 'development';

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (isDevelopment) {
    res.status(500).json({ message: err.message, stack: err.stack });
  } else {
    res.status(500).json({ message: 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

