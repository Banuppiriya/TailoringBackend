// controllers/userController.js
const User = require('../models/User'); // Add this if not present

const createUser = async (req, res) => {
  try {
    const { username, ...rest } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = new User({ username, ...rest });
    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createUser };
