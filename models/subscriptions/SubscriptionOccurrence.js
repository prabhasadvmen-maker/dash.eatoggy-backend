import mongoose from 'mongoose';

const subscriptionOccurrenceSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true
    },
    occurrenceKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true
    },
    dateString: {
      type: String,
      required: true
    },
    dayOfWeek: {
      type: String,
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ORDER_CREATED', 'SKIPPED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true
    },
    skippedAt: {
      type: Date,
      default: null
    },
    generatedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

subscriptionOccurrenceSchema.index({ subscriptionId: 1, scheduledDate: 1 });
subscriptionOccurrenceSchema.index({ status: 1, scheduledDate: 1 });

export default mongoose.models.SubscriptionOccurrence || mongoose.model('SubscriptionOccurrence', subscriptionOccurrenceSchema);
