import Service from '../models/Service.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
// import Order from '../models/Order.js'; // Uncomment if dependency check is needed

// Helper to upload image to Cloudinary
const handleImageUpload = async (file) => {
  if (!file) return {};
  try {
    const uploaded = await uploadImage(file.path);
    return {
      imageUrl: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('Image upload failed.');
  }
};

// CREATE: Admin creates a new service
export const createService = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const image = await handleImageUpload(req.file);
    const service = new Service({ title, description, price, category, ...image });

    await service.save();
    res.status(201).json({ message: 'Service created successfully.', service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// READ: Public fetches services with pagination
export const getServices = async (req, res) => {
  try {
    const { category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const filter = category ? { category } : {};
    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter).skip(skip).limit(limit);

    res.status(200).json({ services, total });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// UPDATE: Admin updates a service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // If new image is uploaded, delete old and upload new
    if (req.file) {
      if (service.imagePublicId) {
        try {
          await deleteImage(service.imagePublicId);
        } catch (cloudinaryError) {
          console.warn('Cloudinary delete failed:', cloudinaryError);
        }
      }

      const { imageUrl, imagePublicId } = await handleImageUpload(req.file);
      service.imageUrl = imageUrl;
      service.imagePublicId = imagePublicId;
    }

    Object.assign(service, req.body);
    await service.save();

    res.status(200).json({ message: 'Service updated successfully.', service });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// DELETE: Admin deletes a service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // Optional: check for linked orders
    /*
    const linkedOrders = await Order.countDocuments({ service: id });
    if (linkedOrders > 0) {
      return res.status(400).json({
        message: 'Cannot delete service; it is associated with one or more orders.',
      });
    }
    */

    if (service.imagePublicId) {
      try {
        await deleteImage(service.imagePublicId);
      } catch (cloudinaryError) {
        console.warn('Failed to delete image from Cloudinary:', cloudinaryError);
      }
    }

    await Service.findByIdAndDelete(id);

    res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Error deleting service:', error);

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Service ID format.' });
    }

    res.status(500).json({ message: 'Internal server error while deleting service.' });
  }
};
