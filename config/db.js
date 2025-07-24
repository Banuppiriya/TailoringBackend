// config/db.js

import mongoose from 'mongoose';

const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 1;

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MongoDB URI is not set in environment variables (MONGO_URI or MONGODB_URI)');
  }

  while (attempt <= maxRetries) {
    try {
      console.log(
        `Connecting to MongoDB [${process.env.NODE_ENV || 'development'}]... (Attempt ${attempt}/${maxRetries})`
      );

      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        retryWrites: true,
        retryReads: true,
      });

      const { host, port, name } = mongoose.connection;
      console.log(`✅ MongoDB connected successfully to database "${name}" at ${host}:${port}`);

      // MongoDB event listeners
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        if (err.name === 'MongoNetworkError') {
          console.log('⚠️ MongoNetworkError: Ensure MongoDB is running and accessible');
        }
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected. Attempting automatic reconnection...');
      });

      break; // Connection successful

    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed: ${error.message}`);

      if (
        error.name === 'MongoNetworkError' ||
        error.message.includes('ECONNREFUSED')
      ) {
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Ensure MongoDB is installed:    sudo apt install mongodb');
        console.log('2. Start MongoDB service:         sudo systemctl start mongodb');
        console.log('3. Enable MongoDB on startup:     sudo systemctl enable mongodb');
        console.log('4. Check MongoDB status:          sudo systemctl status mongodb\n');
      }

      if (attempt === maxRetries) {
        console.error(`❌ Failed to connect to MongoDB after ${maxRetries} attempts. Exiting.`);
        process.exit(1);
      }

      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 3000)); // wait before retry
    }
  }
};

export default connectDB;
