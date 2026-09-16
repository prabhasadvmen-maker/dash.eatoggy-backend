import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/menu/Category.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const cat = await Category.findById('6aaa60dac274111d02487f4f');
  console.log("Category found:", cat ? true : false);
  process.exit(0);
}
check();
