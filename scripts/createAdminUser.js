import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@tailoring.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@tailoring.com',
      password: hashedPassword,
      role: 'admin',
      profilePicture: '',
    });

    await adminUser.save();
    console.log('Admin user created successfully');

    // Create test tailor
    const tailorPassword = await bcrypt.hash('tailor123', 10);
    const tailor = new User({
      username: 'testtailor',
      email: 'tailor@tailoring.com',
      password: tailorPassword,
      role: 'tailor',
      available: true,
      profilePicture: '',
    });

    await tailor.save();
    console.log('Test tailor created successfully');

    // Create test customer
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = new User({
      username: 'testcustomer',
      email: 'customer@tailoring.com',
      password: customerPassword,
      role: 'customer',
      profilePicture: '',
    });

    await customer.save();
    console.log('Test customer created successfully');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdminUser();
