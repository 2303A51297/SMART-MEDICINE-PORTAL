const mongoose = require('mongoose');

const medicineBatchSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine reference is required']
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true
    },
    manufacturingDate: {
      type: Date,
      required: [true, 'Manufacturing date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Batch quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    remainingQuantity: {
      type: Number,
      required: [true, 'Remaining quantity is required'],
      min: [0, 'Remaining quantity cannot be negative']
    },
    unitCost: {
      type: Number,
      default: 0
    },
    supplier: {
      type: String,
      default: 'Global Pharma Distributors'
    },
    status: {
      type: String,
      enum: ['active', 'exhausted', 'expired', 'recalled'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for days until expiry
medicineBatchSchema.virtual('daysToExpiry').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = this.expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('MedicineBatch', medicineBatchSchema);

