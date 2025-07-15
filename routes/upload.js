import express from 'express';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage(); // or diskStorage if saving to disk
const upload = multer({ storage });

router.post('/profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    const file = req.file;

    // For example: Upload to cloud storage, or save to DB
    console.log('File received:', file.originalname);

    res.json({ message: 'Profile picture uploaded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;