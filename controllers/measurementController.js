import Measurement from '../models/Measurement.js';

// Get user's measurements
export const getMyMeasurements = async (req, res) => {
  try {
    const measurement = await Measurement.findOne({ user: req.user.id });
    if (!measurement) {
      // Return a default structure if no measurements are found
      return res.status(200).json({
        upperBody: { chest: '', shoulderWidth: '', armLength: '', bicep: '', neck: '' },
        lowerBody: { waist: '', hip: '', inseam: '', thigh: '', height: '' },
      });
    }
    res.status(200).json(measurement);
  } catch (error) {
    console.error('Get Measurements Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create or update user's measurements
export const saveOrUpdateMeasurements = async (req, res) => {
  try {
    const { upperBody, lowerBody } = req.body;

    if (!upperBody || !lowerBody) {
      return res.status(400).json({ message: 'Both upper and lower body measurements are required.' });
    }

    const updatedMeasurement = await Measurement.findOneAndUpdate(
      { user: req.user.id },
      { $set: { upperBody, lowerBody } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Measurements saved successfully.',
      measurement: updatedMeasurement,
    });
  } catch (error) {
    console.error('Save Measurements Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
