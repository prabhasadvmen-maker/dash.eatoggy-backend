import mongoose from 'mongoose';

const deliveryPartnerDocumentSchema = new mongoose.Schema(
  {
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPartner',
      required: true,
      unique: true
    },
    aadhaarNumber: {
      type: String,
      trim: true
    },
    aadhaarFrontUrl: {
      type: String,
      trim: true
    },
    aadhaarBackUrl: {
      type: String,
      trim: true
    },
    panNumber: {
      type: String,
      trim: true
    },
    panUrl: {
      type: String,
      trim: true
    },
    verificationStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'VERIFIED', 'REJECTED']
    }
  },
  { timestamps: true }
);

export default mongoose.model('DeliveryPartnerDocument', deliveryPartnerDocumentSchema);
