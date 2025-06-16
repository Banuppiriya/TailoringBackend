const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const tailorRoutes = require('./routes/tailorRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tailor', tailorRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Online Tailoring API Running');
});

module.exports = app;