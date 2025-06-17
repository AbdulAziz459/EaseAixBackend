const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicationName: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  sideEffects: {
    type: String,
    default: 'None reported'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
prescriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
prescriptionSchema.index({ user: 1, date: -1 });
prescriptionSchema.index({ user: 1, medicationName: 1 });
prescriptionSchema.index({ user: 1, doctorName: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription; 