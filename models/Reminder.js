const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medication: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'taken', 'missed'],
    default: 'pending'
  },
  takenAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
reminderSchema.index({ user: 1, date: 1 });
reminderSchema.index({ user: 1, status: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder; 