const express = require('express');
const router = express.Router();
const tailorController = require('../controllers/tailorController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Only authenticated users with role 'admin' or 'tailor' can access tailor routes
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'tailor']));

router.get('/', tailorController.getTailors);
router.get('/:id', tailorController.getTailorById);
router.put('/:id', tailorController.updateTailor);
router.delete('/:id', tailorController.deleteTailor);

module.exports = router;