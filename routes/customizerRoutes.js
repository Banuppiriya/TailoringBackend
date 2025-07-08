import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// @route POST /api/customizer/upload
router.post('/upload', upload.array('designs'), (req, res) => {
  const files = req.files.map(file => ({
    name: file.originalname,
    path: `/uploads/${file.filename}`,
    size: file.size
  }));
  res.json({ uploaded: files });
});

// @route POST /api/customizer/submit
router.post('/submit', (req, res) => {
  const {
    designDescription,
    specialInstructions,
    measurements,
    garmentType,
    fabricType,
    selectedColor
  } = req.body;

  // Simulate saving to a DB
  console.log('📦 New Custom Order:', {
    designDescription,
    specialInstructions,
    measurements,
    garmentType,
    fabricType,
    selectedColor
  });

  res.json({ success: true, message: 'Order received successfully!' });
});

export default router;
