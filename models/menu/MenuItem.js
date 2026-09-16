import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // URL of the uploaded image
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    foodType: {
      type: String,
      enum: ['VEG', 'NON_VEG'],
    },
    preparationTime: {
      type: Number, // In minutes
      min: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'DRAFT',
      index: true,
    },
    rejectionReason: {
      type: String,
    },
    submittedAt: {
      type: Date,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin', // SuperAdmin ID
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId, // Could be Restaurant or Admin
      refPath: 'updatedByType', 
    },
    updatedByType: {
      type: String,
      enum: ['Restaurant', 'Admin'],
    }
  },
  {
    timestamps: true,
  }
);

// Compound Index for fast lookup by restaurant and status
menuItemSchema.index({ restaurantId: 1, status: 1 });
// Compound Index for fast lookup by category and subcategory (useful later for customer discovery)
menuItemSchema.index({ categoryId: 1, subcategoryId: 1 });
// Compound Index for Gourmet Creations
menuItemSchema.index({ status: 1, availability: 1, createdAt: -1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
