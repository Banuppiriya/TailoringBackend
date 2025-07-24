import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Use memory storage to handle file uploads before sending to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /profile-picture - Upload profile picture to Cloudinary
router.post('/profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Helper function to upload buffer stream to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'profile-pictures' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(file.buffer);

    // Return uploaded image URL
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
