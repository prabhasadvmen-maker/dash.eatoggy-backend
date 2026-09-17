import mongoose from 'mongoose';

const checkoutItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    itemSubtotal: {
      type: Number,
      required: true
    }
  },
  { _id: true }
);

const checkoutSessionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      default: null
    },
    items: {
      type: [checkoutItemSchema],
      required: true
    },
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
    },
    status: {
      type: String,
      enum: ['DRAFT', 'READY_FOR_PAYMENT', 'EXPIRED'],
      default: 'DRAFT'
    }
  },
  { timestamps: true }
);

export default mongoose.model('CheckoutSession', checkoutSessionSchema);
