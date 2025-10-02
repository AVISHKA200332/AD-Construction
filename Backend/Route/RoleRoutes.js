const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../Controllers/RoleDashboardController');

router.use(auth);
router.get('/dashboard', controller.getDashboard);

module.exports = router;
