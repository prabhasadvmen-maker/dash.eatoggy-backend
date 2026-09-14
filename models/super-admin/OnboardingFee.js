import mongoose from 'mongoose';

const onboardingFeeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'DELIVERY_PARTNER_ONBOARDING_FEE',
      unique: true
    },
    amount: {
      type: Number,
      default: 499,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('OnboardingFee', onboardingFeeSchema);
