import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();

// Multer config for storing files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// POST /api/customizer/upload - upload multiple design files
router.post('/upload', upload.array('designs'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const files = req.files.map(file => ({
    name: file.originalname,
    path: `/uploads/${file.filename}`, // Make sure your frontend can access this path via static serving
    size: file.size
  }));

  res.json({ uploaded: files });
});

// POST /api/customizer/submit - submit custom order data
router.post('/submit', (req, res) => {
  const {
    designDescription,
    specialInstructions,
    measurements,
    garmentType,
    fabricType,
    selectedColor
  } = req.body;

  // TODO: Save this data to your database here

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
