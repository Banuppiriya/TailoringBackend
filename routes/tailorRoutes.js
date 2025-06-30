import express from 'express';
import * as tailorController from '../controllers/tailorController.js';
import auth from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // if using image upload in profile

// 1) Routes for logged-in Tailor only:
router.use(auth);
router.use(role('tailor'));

router.get('/me', tailorController.getProfile);
router.put('/me', upload.single('profileImage'), tailorController.updateProfile);

// 2) After self-service, routes for Admin only:
router.use(role('admin'));

router.get('/', tailorController.getTailors);
router.get('/:id', tailorController.getTailorById);
router.put('/:id', tailorController.updateTailor);
router.delete('/:id', tailorController.deleteTailor);

export default router;
