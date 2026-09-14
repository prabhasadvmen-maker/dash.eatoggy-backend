import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },
    targetModel: {
      type: String
    },
    details: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
