// controllers/tailorController.js
const Tailor = require('../models/User');

// Admin methods:
exports.getTailors = async (req, res) => { /*...*/ };
exports.getTailorById = async (req, res) => { /*...*/ };
exports.updateTailor = async (req, res) => { /*...*/ };
exports.deleteTailor = async (req, res) => { /*...*/ };

// Tailor self-service methods:
exports.getProfile = async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.user.id);
    if (!tailor || tailor.role !== 'tailor') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    res.json(tailor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.user.id);
    if (!tailor || tailor.role !== 'tailor') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    const { username, email, bio, phone } = req.body;
    if (username) tailor.username = username;
    if (email) tailor.email = email;
    if (bio) tailor.bio = bio;
    if (phone) tailor.phone = phone;
    // If handling profile image:
    // if (req.file) { /* upload/delete logic */ }
    await tailor.save();
    res.json({ message: 'Profile updated', tailor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
