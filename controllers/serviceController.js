const Service = require('../models/Service');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

// ✅ ADMIN: Create a new service
exports.createService = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let image;

    if (req.file) {
      const uploaded = await uploadImage(req.file.path);
      image = { imageUrl: uploaded.secure_url, imagePublicId: uploaded.public_id };
    }

    const service = new Service({ title, description, price, category, ...image });
    await service.save();

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ PUBLIC/USER: Get all services (optional category filter)
exports.getServices = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = category ? { category } : {};
    const services = await Service.find(filter);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN: Update a service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category } = req.body;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (req.file) {
      if (service.imagePublicId) await deleteImage(service.imagePublicId);
      const uploaded = await uploadImage(req.file.path);
      service.imageUrl = uploaded.secure_url;
      service.imagePublicId = uploaded.public_id;
    }

    if (title) service.title = title;
    if (description) service.description = description;
    if (price) service.price = price;
    if (category) service.category = category;

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN: Delete a service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.imagePublicId) await deleteImage(service.imagePublicId);
    await service.remove();

    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
