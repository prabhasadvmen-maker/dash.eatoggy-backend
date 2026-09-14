import mongoose from 'mongoose';

const deliveryPartnerBankSchema = new mongoose.Schema(
  {
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPartner',
      required: true,
      unique: true
    },
    accountHolderName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('DeliveryPartnerBank', deliveryPartnerBankSchema);
