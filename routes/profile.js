const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/profile-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// Get user's profile
router.get('/', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.userId });
    
    if (!profile) {
      // Create a new profile if one doesn't exist
      profile = new Profile({
        user: req.user.userId,
        name: req.user.name || '',
        email: req.user.email || '',
        phone: '',
        profileImage: '/default-profile.png',
        medicalConditions: '',
        currentMedications: '',
        pastSurgeries: '',
        foodAllergies: '',
        drugAllergies: '',
        otherAllergies: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: ''
      });
      
      try {
        await profile.save();
        console.log('Created new profile for user:', req.user.userId);
      } catch (saveError) {
        console.error('Error creating new profile:', saveError);
        return res.status(500).json({ message: 'Failed to create profile' });
      }
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user's profile
router.put('/', [
  auth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('age').optional().isInt({ min: 0, max: 120 }).withMessage('Valid age is required'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group is required'),
  body('height').optional().isFloat({ min: 0 }).withMessage('Valid height is required'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Valid weight is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    let profile = await Profile.findOne({ user: req.user.userId });
    
    if (!profile) {
      // Create a new profile if one doesn't exist
      profile = new Profile({
        user: req.user.userId,
        name: req.user.name || '',
        email: req.user.email || '',
        phone: '',
        profileImage: '/default-profile.png'
      });
    }

    // Update profile fields
    const updateFields = [
      'name', 'email', 'phone', 'age', 'gender', 'bloodGroup',
      'height', 'weight', 'address', 'city', 'province', 'cnic',
      'medicalConditions', 'currentMedications', 'pastSurgeries',
      'foodAllergies', 'drugAllergies', 'otherAllergies',
      'emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();
    console.log('Profile updated successfully for user:', req.user.userId);
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Upload profile image
router.post('/image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profile = await Profile.findOne({ user: req.user.userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Delete old profile image if it exists
    if (profile.profileImage) {
      const oldImagePath = path.join(__dirname, '..', profile.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update profile image path
    const imagePath = `/uploads/profile-images/${req.file.filename}`;
    profile.profileImage = imagePath;
    await profile.save();

    res.json({ profileImage: imagePath });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Failed to upload profile image' });
  }
});

module.exports = router; 