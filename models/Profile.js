const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  profileImage: {
    type: String,
    default: '/default-profile.png'
  },
  age: Number,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  height: Number,
  weight: Number,
  address: String,
  city: String,
  province: String,
  cnic: String,
  medicalConditions: String,
  currentMedications: String,
  pastSurgeries: String,
  foodAllergies: String,
  drugAllergies: String,
  otherAllergies: String,
  emergencyContactName: String,
  emergencyContactRelationship: String,
  emergencyContactPhone: String,
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
profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for faster queries
profileSchema.index({ user: 1 });
profileSchema.index({ email: 1 });

module.exports = mongoose.model('Profile', profileSchema); 