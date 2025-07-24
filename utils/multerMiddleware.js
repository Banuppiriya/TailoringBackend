import multer from 'multer';
import path from 'path';

// Create 'uploads' folder if it doesn't exist (optional but recommended)
import fs from 'fs';
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use path.extname to preserve file extension
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-'); // sanitize spaces
    cb(null, `${Date.now()}-${baseName}${ext}`);
  }
});

const upload = multer({ storage });
export default upload;
