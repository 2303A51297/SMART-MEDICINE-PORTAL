const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed'],
      default: 'assigned'
    },
    customerName: {
      type: String,
      required: true
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true }
    },
    deliveryNotes: {
      type: String,
      default: ''
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    pickedUpAt: {
      type: Date
    },
    outForDeliveryAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    otpVerified: {
      type: Boolean,
      default: false
    },
    deliveryCode: {
      type: String,
      default: '4821'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Delivery', deliverySchema);

