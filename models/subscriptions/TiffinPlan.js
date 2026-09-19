import mongoose from 'mongoose';

const tiffinItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  { _id: false }
);

const tiffinPlanSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    mealType: {
      type: String,
      enum: ['VEG', 'NON_VEG', 'LUNCH', 'DINNER', 'BOTH'],
      default: 'LUNCH'
    },
    items: {
      type: [tiffinItemSchema],
      default: []
    },
    pricePerMeal: {
      type: Number,
      required: true,
      min: 0
    },
    planDurationDays: {
      type: Number,
      required: true,
      min: 1,
      default: 7
    },
    totalMeals: {
      type: Number,
      required: true,
      min: 1,
      default: 7
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    availableDays: {
      type: [String],
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      default: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

tiffinPlanSchema.index({ restaurantId: 1, status: 1 });

export default mongoose.models.TiffinPlan || mongoose.model('TiffinPlan', tiffinPlanSchema);
