const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required']
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true
    },
    patientAge: {
      type: Number,
      default: 30
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true
    },
    hospitalOrClinic: {
      type: String,
      default: 'Apollo Healthcare Clinic'
    },
    prescriptionFile: {
      type: String,
      required: [true, 'Prescription image or document is required']
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date
    },
    validUntil: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);

