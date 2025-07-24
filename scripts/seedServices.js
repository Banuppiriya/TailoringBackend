import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';
import connectDB from '../config/db.js';

dotenv.config();

const services = [
  {
    title: "Custom Suit Tailoring",
    description: "Professional tailoring service for custom-made suits",
    price: 599.99,
    imageUrl: "https://example.com/suit.jpg"
  },
  {
    title: "Dress Alterations",
    description: "Expert alterations for all types of dresses",
    price: 89.99,
    imageUrl: "https://example.com/dress.jpg"
  },
  {
    title: "Pants Hemming",
    description: "Quick and professional pants hemming service",
    price: 29.99,
    imageUrl: "https://example.com/pants.jpg"
  },
  {
    title: "Wedding Dress Alterations",
    description: "Specialized alterations for wedding dresses",
    price: 299.99,
    imageUrl: "https://example.com/wedding.jpg"
  },
  {
    title: "Shirt Tailoring",
    description: "Custom shirt tailoring and alterations",
    price: 79.99,
    imageUrl: "https://example.com/shirt.jpg"
  }
];

const seedServices = async () => {
  try {
    await connectDB();

    // Clean existing services
    await Service.deleteMany({});
    console.log('🗑️ Cleared existing services');

    // Insert new services
    const insertedServices = await Service.insertMany(services);
    console.log(`✅ Successfully seeded ${insertedServices.length} services`);

    mongoose.disconnect();
    console.log('📡 Disconnected from database');

  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  }
};

seedServices();
