import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    foodNameSnapshot: {
      type: String,
      required: true
    },
    foodImageSnapshot: {
      type: String,
      default: ''
    },
    unitPrice: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    itemTotal: {
      type: Number,
      required: true
    },
    foodType: {
      type: String,
      enum: ['VEG', 'NON_VEG'],
      default: 'VEG'
    }
  },
  { _id: true }
);

const orderAddressSnapshotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    mobile: {
      type: String,
      required: true
    },
    addressLine1: {
      type: String,
      required: true
    },
    addressLine2: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: 'Home'
    }
  },
  { _id: false }
);

const orderPricingSnapshotSchema = new mongoose.Schema(
  {
    itemSubtotal: {
      type: Number,
      required: true
    },
    packagingFee: {
      type: Number,
      required: true,
      default: 20
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 35
    },
    tax: {
      type: Number,
      required: true,
      default: 0
    },
    platformFee: {
      type: Number,
      required: true,
      default: 5
    },
    discount: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const statusEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'PLACED',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'REJECTED',
        'CANCELLED'
      ],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      default: 'SYSTEM'
    },
    note: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
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
    items: {
      type: [orderItemSnapshotSchema],
      required: true
    },
    deliveryAddress: {
      type: orderAddressSnapshotSchema,
      required: true
    },
    pricing: {
      type: orderPricingSnapshotSchema,
      required: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['RAZORPAY', 'COD', 'WALLET'],
      default: 'RAZORPAY'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING'
    },
    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'REJECTED',
        'CANCELLED'
      ],
      default: 'PLACED',
      index: true
    },
    statusHistory: {
      type: [statusEventSchema],
      default: []
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    preparingAt: {
      type: Date,
      default: null
    },
    readyAt: {
      type: Date,
      default: null
    },
    preparationStartedAt: {
      type: Date,
      default: null
    },
    preparationCompletedAt: {
      type: Date,
      default: null
    },
    preparationNotes: {
      type: String,
      default: ''
    },
    kitchenNotes: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      enum: ['NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
      index: true
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
      index: true
    },
    subscriptionOccurrenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionOccurrence',
      default: null,
      index: true
    },
    isSubscriptionOrder: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
