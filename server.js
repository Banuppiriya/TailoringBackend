require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tailorRoutes = require('./routes/tailorRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const serviceRoutes = require('./routes/serviceRoutes');

connectDB();



const app = express();

app.use(express.json());

// Static folder to serve uploaded files if needed for multer
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tailor', tailorRoutes);
app.use('/api/user', userRoutes);
app.use('/api', serviceRoutes); 


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));