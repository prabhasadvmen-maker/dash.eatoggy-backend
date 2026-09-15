import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config({ path: './.env' });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Admin = (await import('./models/admin/Admin.js')).default;
    
    let admin = await Admin.findOne({ email: 'superadmin@eatoggy.com' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('superadmin@000', salt);
      admin = await Admin.create({
        name: 'Super Admin',
        email: 'superadmin@eatoggy.com',
        password: hashedPassword,
        role: 'SuperAdmin'
      });
    }
    
    const payload = { admin: { id: admin._id, role: 'SuperAdmin' } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    console.log(token);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
seed();
