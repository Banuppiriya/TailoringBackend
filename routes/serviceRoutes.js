import express from 'express';
import * as serviceController from '../controllers/serviceController.js';
import auth from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 🔓 PUBLIC: View services by category (men, women, kids)
router.get('/', serviceController.getServices);

// 🔐 ADMIN ROUTES:
router.use(auth); // Must be logged in
router.post('/', role(['admin']), upload.single('image'), serviceController.createService);
router.put('/:id', role(['admin']), upload.single('image'), serviceController.updateService);
router.delete('/:id', role(['admin']), serviceController.deleteService);

export default router;
