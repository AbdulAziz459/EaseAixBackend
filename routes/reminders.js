const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');

// Get all reminders for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user.userId })
      .sort({ date: 1, time: 1 });
    res.json(reminders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new reminder
router.post('/', [
  auth,
  body('medication').notEmpty(),
  body('dosage').notEmpty(),
  body('time').notEmpty(),
  body('date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { medication, dosage, time, date, notes } = req.body;

    const reminder = new Reminder({
      user: req.user.userId,
      medication,
      dosage,
      time,
      date,
      notes
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a reminder
router.put('/:id', [
  auth,
  body('medication').notEmpty(),
  body('dosage').notEmpty(),
  body('time').notEmpty(),
  body('date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const { medication, dosage, time, date, notes } = req.body;

    reminder.medication = medication;
    reminder.dosage = dosage;
    reminder.time = time;
    reminder.date = date;
    reminder.notes = notes;

    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark reminder as taken
router.put('/:id/taken', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.status = 'taken';
    reminder.takenAt = new Date();

    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 