import Service from '../models/Service.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
// Make sure to import Order model if services can be linked to orders
// import Order from '../models/Order.js'; // <--- Potentially needed for dependency check

// Helper to handle image upload logic
const handleImageUpload = async (file) => {
  if (!file) return {};
  try {
    const uploaded = await uploadImage(file.path);
    return {
      imageUrl: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
    };
  } catch (uploadError) {
    console.error('Cloudinary upload failed:', uploadError);
    throw new Error('Image upload failed.'); // Re-throw to be caught by the main try/catch
  }
};

// ADMIN: Create a new service
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
    console.error('Error creating service:', error); // Add console.error for all endpoints
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PUBLIC/USER: Get all services
export const getServices = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const services = await Service.find(filter);
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ADMIN: Update a service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    if (req.file) {
      if (service.imagePublicId) {
        try {
          await deleteImage(service.imagePublicId);
        } catch (cloudinaryError) {
          console.warn('Could not delete old image from Cloudinary:', cloudinaryError);
          // Don't block update if old image deletion fails
        }
      }
      const { imageUrl, imagePublicId } = await handleImageUpload(req.file);
      service.imageUrl = imageUrl;
      service.imagePublicId = imagePublicId;
    }

    // Update other fields
    Object.assign(service, req.body); // This safely updates fields from req.body

    await service.save();
    res.status(200).json({ message: 'Service updated successfully.', service });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ADMIN: Delete a service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // First, find the service to get its imagePublicId
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // --- IMPORTANT: Dependency Check (if services are linked to orders) ---
    // If you have an Order model that references Service, you MUST import it
    // and perform a check here. If not handled, this could be the 500 error cause
    // if a foreign key constraint is violated or related data can't be implicitly deleted.
    /*
    Example:
    import Order from '../models/Order.js'; // Ensure this import is at the top

    const relatedOrders = await Order.countDocuments({ service: id });
    if (relatedOrders > 0) {
      return res.status(400).json({
        message: 'Cannot delete service. It is currently associated with one or more orders.',
      });
    }
    */

    // Delete image from Cloudinary if it exists
    if (service.imagePublicId) {
      try {
        await deleteImage(service.imagePublicId);
      } catch (cloudinaryError) {
        console.warn('Could not delete image from Cloudinary:', cloudinaryError);
        // It's often okay to proceed with service deletion even if Cloudinary deletion fails,
        // as the main goal is to remove the service record. Log a warning.
      }
    }

    // Use findByIdAndDelete for modern Mongoose deletion
    const result = await Service.findByIdAndDelete(id);

    // This check is technically redundant since we already checked `service` above,
    // but useful if you directly use findByIdAndDelete without a prior find.
    if (!result) {
        return res.status(404).json({ message: 'Service not found after delete attempt (should not happen).' });
    }

    res.status(200).json({ message: 'Service deleted successfully.' });

  } catch (error) {
    // Crucial: Log the full error for debugging on your backend server's console
    console.error('Error deleting service:', error);

    // Provide more specific error messages if known, otherwise generic 500
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Service ID format provided.' });
    }

    res.status(500).json({ message: 'Internal server error while deleting service.' });
  }
};