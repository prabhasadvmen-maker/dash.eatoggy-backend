import mongoose from 'mongoose';

const planSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    mealType: { type: String, default: 'VEG' },
    items: [{ name: String, quantity: Number }],
    pricePerMeal: { type: Number, required: true },
    planDurationDays: { type: Number, required: true },
    totalMeals: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  },
  { _id: false }
);

const subscriptionAddressSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    label: { type: String, default: 'Home' }
  },
  { _id: false }
);

const subscriptionPricingSnapshotSchema = new mongoose.Schema(
  {
    planPrice: { type: Number, required: true },
    packagingFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TiffinPlan',
      required: true
    },
    planSnapshot: {
      type: planSnapshotSchema,
      required: true
    },
    deliveryAddress: {
      type: subscriptionAddressSnapshotSchema,
      required: true
    },
    pricing: {
      type: subscriptionPricingSnapshotSchema,
      required: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING'
    },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING_PAYMENT',
      index: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    scheduleDays: {
      type: [String],
      default: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    },
    totalOccurrences: {
      type: Number,
      default: 0
    },
    completedOccurrencesCount: {
      type: Number,
      default: 0
    },
    pausedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

subscriptionSchema.index({ customerId: 1, status: 1 });
subscriptionSchema.index({ restaurantId: 1, status: 1 });

export default mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
