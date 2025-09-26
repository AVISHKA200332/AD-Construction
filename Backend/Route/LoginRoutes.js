const express = require('express');
const router = express.Router();
const loginController = require('../Controllers/LoginController');

// Login route
router.post('/', loginController.login);

module.exports = router;
