require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

// Import routers
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tailorRoutes = require('./routes/tailorRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

console.log('authRoutes:', typeof authRoutes);
console.log('adminRoutes:', typeof adminRoutes);
console.log('tailorRoutes:', typeof tailorRoutes);
console.log('userRoutes:', typeof userRoutes);
console.log('serviceRoutes:', typeof serviceRoutes);

connectDB();

const app = express();
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tailor', tailorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/services', serviceRoutes); // e.g., mount serviceRoutes at /api/services

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
