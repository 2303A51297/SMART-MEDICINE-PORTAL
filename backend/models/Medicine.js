const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true
    },
    genericName: {
      type: String,
      required: [true, 'Generic chemical name is required'],
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Brand/Trade name is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    prescriptionRequired: {
      type: Boolean,
      default: false
    },
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Ointment', 'Injection', 'Inhaler', 'Drops', 'Powder'],
      default: 'Tablet'
    },
    strength: {
      type: String,
      default: '500 mg'
    },
    manufacturer: {
      type: String,
      default: 'Cipla Health Ltd.'
    },
    sideEffects: {
      type: String,
      default: 'May cause mild drowsiness or nausea in rare cases. Consult doctor if symptoms persist.'
    },
    storageInstructions: {
      type: String,
      default: 'Store in a cool, dry place away from direct sunlight.'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
    },
    totalStock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    reorderLevel: {
      type: Number,
      default: 25
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for low stock alert
medicineSchema.virtual('isLowStock').get(function () {
  return this.totalStock <= this.reorderLevel;
});

module.exports = mongoose.model('Medicine', medicineSchema);

