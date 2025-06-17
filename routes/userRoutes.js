// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/userController'); // ✅ Import correctly

router.post('/create', createUser); // ✅ Use correct function

module.exports = router;
