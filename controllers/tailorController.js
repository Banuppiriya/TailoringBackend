// controllers/tailorController.js

import Tailor from '../models/User.js';

// ✅ ADMIN: Get all tailors
export const getTailors = async (req, res) => {
  try {
    const tailors = await Tailor.find({ role: 'tailor' });
    res.json(tailors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN: Get single tailor by ID
export const getTailorById = async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.params.id);
    if (!tailor || tailor.role !== 'tailor') {
      return res.status(404).json({ message: 'Tailor not found' });
    }
    res.json(tailor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN: Update tailor details
export const updateTailor = async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.params.id);
    if (!tailor || tailor.role !== 'tailor') {
      return res.status(404).json({ message: 'Tailor not found' });
    }

    const { username, email, bio, phone } = req.body;

    if (username) tailor.username = username;
    if (email) tailor.email = email;
    if (bio) tailor.bio = bio;
    if (phone) tailor.phone = phone;

    await tailor.save();
    res.json({ message: 'Tailor updated', tailor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN: Delete a tailor
export const deleteTailor = async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.params.id);
    if (!tailor || tailor.role !== 'tailor') {
      return res.status(404).json({ message: 'Tailor not found' });
    }
    await tailor.remove();
    res.json({ message: 'Tailor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ TAILOR: Get own profile
export const getProfile = async (req, res) => {
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

// ✅ TAILOR: Update own profile
export const updateProfile = async (req, res) => {
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

    // Optionally handle image update:
    // if (req.file) { /* image upload logic */ }

    await tailor.save();
    res.json({ message: 'Profile updated', tailor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
