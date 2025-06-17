const Tailor = require('../models/User'); // Assuming Tailor and User same collection, differentiated by role

exports.getTailors = async (req, res) => {
  try {
    const tailors = await Tailor.find({ role: 'tailor' });
    res.json(tailors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTailorById = async (req, res) => {
  try {
    const tailor = await Tailor.findOne({ _id: req.params.id, role: 'tailor' });
    if (!tailor) return res.status(404).json({ error: 'Tailor not found' });
    res.json(tailor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTailor = async (req, res) => {
  try {
    const updatedTailor = await Tailor.findOneAndUpdate(
      { _id: req.params.id, role: 'tailor' },
      req.body,
      { new: true }
    );
    if (!updatedTailor) return res.status(404).json({ error: 'Tailor not found' });
    res.json(updatedTailor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTailor = async (req, res) => {
  try {
    const deletedTailor = await Tailor.findOneAndDelete({ _id: req.params.id, role: 'tailor' });
    if (!deletedTailor) return res.status(404).json({ error: 'Tailor not found' });
    res.json({ message: 'Tailor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};