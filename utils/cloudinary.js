import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Validate required environment variables
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary configuration in environment variables.');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Upload an image file to Cloudinary under the 'services' folder.
 * @param {string} filePath - Local path or remote URL of the image to upload
 * @returns {Promise<object>} - Cloudinary upload response
 */
export const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'services',
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload to Cloudinary failed.');
  }
};

/**
 * Delete an image from Cloudinary by its public ID.
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<object>} - Cloudinary deletion response
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error('Image deletion from Cloudinary failed.');
  }
};

// Export the configured Cloudinary instance for other usages
export { cloudinary };
