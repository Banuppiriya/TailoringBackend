export const updateProfile = async (req, res) => {
  try {
    const tailor = await User.findById(req.user.id);

    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found' });
    }

    // Update text fields if provided
    const updatableFields = ['username', 'email'];
    updatableFields.forEach((field) => {
      if (req.body[field]) {
        tailor[field] = req.body[field];
      }
    });

    // Update profile picture if file is uploaded (e.g., via Cloudinary)
    if (req.file && req.file.path) {
      tailor.profilePicture = req.file.path;
    }

    const updatedTailor = await tailor.save();

    res.status(200).json({
      message: 'Profile updated successfully.',
      tailor: {
        _id: updatedTailor._id,
        username: updatedTailor.username,
        email: updatedTailor.email,
        profilePicture: updatedTailor.profilePicture,
      },
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
