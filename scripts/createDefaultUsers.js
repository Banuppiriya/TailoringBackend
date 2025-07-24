import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createDefaultUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123456';
    
    // Check if admin exists
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully');
    } else {
      // Update admin password if user exists
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin password updated');
    }

    console.log('Admin credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

createDefaultUsers();
