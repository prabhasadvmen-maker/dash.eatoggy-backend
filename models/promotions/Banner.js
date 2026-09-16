import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    trim: true
  },
  ctaText: {
    type: String,
    default: 'Order Now',
    trim: true
  },
  ctaLink: {
    type: String,
    trim: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
