import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await mongoose.connection.collection('admins').updateOne(
    { email: 'superadmin@eatoggy.com' },
    { $set: { role: 'SuperAdmin' } }
  );
  console.log('Done');
  process.exit(0);
});
