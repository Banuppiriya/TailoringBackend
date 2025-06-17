const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// 🔓 PUBLIC: View services by category (men, women, kids)
router.get('/', serviceController.getServices);

// 🔐 ADMIN ROUTES:
router.use(auth); // Must be logged in
router.post('/', role(['admin']), upload.single('image'), serviceController.createService);
router.put('/:id', role(['admin']), upload.single('image'), serviceController.updateService);
router.delete('/:id', role(['admin']), serviceController.deleteService);

module.exports = router;
