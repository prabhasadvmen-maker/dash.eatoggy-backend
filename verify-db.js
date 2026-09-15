import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const restaurants = db.collection('restaurants');
    
    console.log("=== MONGODB INDEXES ===");
    const indexes = await restaurants.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    console.log("\n=== DATABASE DATA SAFETY ===");
    const totalCount = await restaurants.countDocuments();
    const approvedCount = await restaurants.countDocuments({ status: 'APPROVED' });
    const passwordCount = await restaurants.countDocuments({ password: { $exists: true, $ne: null, $ne: "" } });
    
    console.log(`Total Restaurants: ${totalCount}`);
    console.log(`Approved Restaurants: ${approvedCount}`);
    console.log(`Restaurants with Passwords: ${passwordCount}`);

    // Check duplicate emails
    const duplicateEmails = await restaurants.aggregate([
      { $match: { email: { $type: "string", $ne: "" } } },
      { $group: { _id: "$email", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    console.log(`Duplicate Emails (non-null): ${duplicateEmails.length}`);

    // Check duplicate mobiles
    const duplicateMobiles = await restaurants.aggregate([
      { $match: { mobile: { $type: "string", $ne: "" } } },
      { $group: { _id: "$mobile", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    console.log(`Duplicate Mobiles (non-null): ${duplicateMobiles.length}`);

  } catch (err) {
    console.error("DB Verification Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
verify();
