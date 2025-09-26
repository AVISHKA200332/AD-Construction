const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthControllers');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

// Protected route (requires authentication)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;