import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Admin = (await import('./models/admin/Admin.js')).default;
  await Admin.deleteMany({ email: 'superadmin@eatoggy.com' });
  console.log('Deleted admin');
  process.exit(0);
}
reset();
