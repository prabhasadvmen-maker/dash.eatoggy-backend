import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true
    },
    mobile: {
      type: String,
      required: [true, 'Recipient mobile is required'],
      trim: true
    },
    addressLine1: {
      type: String,
      required: [true, 'Address Line 1 is required'],
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      default: 'Delhi NCR'
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true
    },
    landmark: {
      type: String,
      trim: true,
      default: ''
    },
    label: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model('Address', addressSchema);
