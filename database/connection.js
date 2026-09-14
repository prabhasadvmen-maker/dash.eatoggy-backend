import mongoose from 'mongoose';
import { dbConfig, logger, validateEnv } from '../config/index.js';
import Customer from '../models/customers/Customer.js';

export const connectDB = async () => {
  validateEnv();
  try {
    const conn = await mongoose.connect(dbConfig.uri, dbConfig.options);
    logger.info('MongoDB Connected');
    try {
      await Customer.syncIndexes();
    } catch (e) {
      // index sync non-blocking
    }
    return conn;
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
