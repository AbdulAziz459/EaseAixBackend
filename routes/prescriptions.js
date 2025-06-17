const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Get all prescriptions for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user.userId })
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new prescription
router.post('/', [
  auth,
  body('medicationName').notEmpty(),
  body('doctorName').notEmpty(),
  body('patientName').notEmpty(),
  body('date').isISO8601(),
  body('dosage').notEmpty(),
  body('instructions').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      medicationName,
      doctorName,
      patientName,
      date,
      dosage,
      instructions,
      sideEffects
    } = req.body;

    const prescription = new Prescription({
      user: req.user.userId,
      medicationName,
      doctorName,
      patientName,
      date,
      dosage,
      instructions,
      sideEffects
    });

    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a prescription
router.put('/:id', [
  auth,
  body('medicationName').notEmpty(),
  body('doctorName').notEmpty(),
  body('patientName').notEmpty(),
  body('date').isISO8601(),
  body('dosage').notEmpty(),
  body('instructions').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const {
      medicationName,
      doctorName,
      patientName,
      date,
      dosage,
      instructions,
      sideEffects
    } = req.body;

    prescription.medicationName = medicationName;
    prescription.doctorName = doctorName;
    prescription.patientName = patientName;
    prescription.date = date;
    prescription.dosage = dosage;
    prescription.instructions = instructions;
    prescription.sideEffects = sideEffects;

    await prescription.save();
    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a prescription
router.delete('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({ message: 'Prescription deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share prescription via email
router.post('/:id/share', [
  auth,
  body('recipientEmail').isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const { recipientEmail } = req.body;

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Prescription for ${prescription.medicationName}`,
      html: `
        <h2>Prescription Details</h2>
        <p><strong>Medication:</strong> ${prescription.medicationName}</p>
        <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
        <p><strong>Patient:</strong> ${prescription.patientName}</p>
        <p><strong>Date:</strong> ${prescription.date.toLocaleDateString()}</p>
        <p><strong>Dosage:</strong> ${prescription.dosage}</p>
        <p><strong>Instructions:</strong> ${prescription.instructions}</p>
        <p><strong>Side Effects:</strong> ${prescription.sideEffects}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Prescription shared successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 