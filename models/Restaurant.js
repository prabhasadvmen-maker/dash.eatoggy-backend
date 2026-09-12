import mongoose from 'mongoose';

const RestaurantSchema = new mongoose.Schema({
  // Owner Details
  ownerName: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Restaurant Details
  restaurantName: { type: String, required: true },
  restaurantType: { type: String, required: true }, // e.g., Cafe, Cloud Kitchen, Fine Dining
  cuisine: { type: String }, // e.g., North Indian, Chinese, Italian
  fullAddress: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  operatingHours: {
    open: { type: String },
    close: { type: String }
  },

  // Document Links (R2 URLs)
  documents: {
    panCard: { type: String },
    businessRegistration: { type: String },
    foodLicense: { type: String },
    idProof: { type: String },
    restaurantImage: { type: String },
    menu: { type: String },
    kitchenVideo: { type: String }
  },

  // Bank Details
  bankDetails: {
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String }
  },

  // Flow State
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    default: 'PENDING'
  },
  rejectionReason: { type: String, default: '' },
  suspensionReason: { type: String, default: '' },
  
  // Security
  isPhoneVerified: { type: Boolean, default: false },
  paymentId: { type: String, default: null },
  lastLogin: { type: Date }

}, { timestamps: true });

export default mongoose.model('Restaurant', RestaurantSchema);
