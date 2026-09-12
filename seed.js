import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is missing from .env file');
  process.exit(1);
}

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');

    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!email || !password) {
      console.error('ERROR: SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD missing from .env');
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update if exists, create if not
    await Admin.findOneAndUpdate(
      { email },
      { email, password: hashedPassword },
      { upsert: true, returnDocument: 'after' }
    );

    console.log('SuperAdmin seeded successfully');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
