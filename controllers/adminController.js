exports.createService = async (req, res) => {
  const { name, description, price } = req.body;
  try {
    let exist = await Service.findOne({ name });
    if (exist) {
      return res.status(400).json({ message: 'Service already exists' });
    }
    const service = new Service({ name, description, price });
    await service.save();
    res.status(201).json(service);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};