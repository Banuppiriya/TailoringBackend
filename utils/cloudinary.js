import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image file to Cloudinary under the 'services' folder.
 * @param {string} filePath - Path or buffer of the image file to upload
 * @returns {Promise} - Cloudinary upload response
 */
export const uploadImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, { folder: 'services' });
};

/**
 * Delete an image from Cloudinary by its public ID.
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise} - Cloudinary delete response
 */
export const deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

// Export cloudinary instance in case you need direct access elsewhere
export { cloudinary };
