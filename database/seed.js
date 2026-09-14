import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env, validateEnv, logger } from '../config/index.js';
import Admin from '../models/Admin.js';

const seedAdmin = async () => {
  validateEnv();
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB Connected');

    const email = env.SUPERADMIN_EMAIL;
    const password = env.SUPERADMIN_PASSWORD;

    if (!email || !password) {
      logger.error('ERROR: SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD missing from .env');
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

    logger.info('SuperAdmin seeded successfully');
    logger.info(`Email: ${email}`);
    logger.info(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
