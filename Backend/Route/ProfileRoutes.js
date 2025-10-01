const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../Controllers/ProfileController');

router.use(auth);
router.get('/me', controller.getProfile); // own profile
router.get('/activity', controller.getActivity); // own activity
router.post('/me/image', controller.uploadProfileImage, controller.updateProfile); // upload + update
router.put('/me', controller.updateProfile);
router.post('/me/password', controller.changePassword);

// Admin overrides
router.get('/:id', controller.getProfile);
router.get('/:id/activity', controller.getActivity);
router.put('/:id', controller.updateProfile);
router.post('/:id/password', controller.changePassword);

module.exports = router;