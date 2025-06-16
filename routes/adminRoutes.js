const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  createService,
  updateService,
  deleteService,
  getAllServices,
  // other admin functions
} = require('../controllers/adminController');

// All admin routes require admin role and auth
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/services', getAllServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// other routes...

module.exports = router;