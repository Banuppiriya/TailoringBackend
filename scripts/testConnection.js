// testConnection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

async function testConnection() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI is not set in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Successfully connected to MongoDB');

    // Try to find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log('✅ Found admin user:', adminUser.email);
    } else {
      console.log('❌ No admin user found');
      
      // Create a test admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await newAdmin.save();
      console.log('✅ Created test admin user:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testConnection();
