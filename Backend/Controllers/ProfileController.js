const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../Model/UserModel');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = path.join(process.cwd(), 'uploads', 'profileImages');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname || '.jpg');
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads allowed'));
    cb(null, true);
  }
});

// Middleware wrapper for single image field
const uploadProfileImage = upload.single('profileImage');

// Get own profile or by id (admin override)
async function getProfile(req, res) {
  try {
    const targetId = req.params.id || req.user._id;
    if (String(targetId) !== String(req.user._id) && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(targetId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load profile', error: err.message });
  }
}

// Update profile (role-specific fields)
async function updateProfile(req, res) {
  try {
    const targetId = req.params.id || req.user._id;
    if (String(targetId) !== String(req.user._id) && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const body = req.body;
    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const editable = ['name','phone','age','address','notificationPreferences'];
    editable.forEach(f => { if (body[f] !== undefined) user[f] = body[f]; });

    // Role-specific updates
    if (user.role === 'Client' && body.companyDetails) {
      user.companyDetails = { ...user.companyDetails, ...body.companyDetails };
    }
    if ((user.role === 'Project Manager') && Array.isArray(body.projectsManaged)) {
      user.projectsManaged = body.projectsManaged;
    }
    if ((user.role === 'Site Supervisor' || user.role === 'Site Manager' || user.role === 'Supervisor') && Array.isArray(body.assignedSites)) {
      user.assignedSites = body.assignedSites;
    }
    if (user.role === 'Labor') {
      if (Array.isArray(body.skills)) user.skills = body.skills;
      if (body.availability) user.availability = { ...user.availability, ...body.availability };
    }
    if (req.file) {
      const rel = `/uploads/profileImages/${req.file.filename}`;
      user.profileImage = rel;
    } else if (body.profileImage && body.profileImage.startsWith('data:image/')) {
      // Optional: store base64 directly (not recommended for large images)
      user.profileImage = body.profileImage;
    }
    await user.save();
    user.addActivity('PROFILE_UPDATED', { by: req.user._id });
    const sanitized = user.toObject();
    delete sanitized.password;
    return res.json({ user: sanitized });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
}

// Change password (self or admin)
async function changePassword(req, res) {
  try {
    const targetId = req.params.id || req.user._id;
    if (String(targetId) !== String(req.user._id) && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'New password must be 6+ characters' });
    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.user.role !== 'Admin') {
      // verify current
      const bcrypt = require('bcryptjs');
      const match = await bcrypt.compare(currentPassword || '', user.password);
      if (!match) return res.status(400).json({ message: 'Current password incorrect' });
    }
    user.password = newPassword; // will hash in pre-save
    await user.save();
    user.addActivity('PASSWORD_CHANGED', { by: req.user._id });
    return res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to change password', error: err.message });
  }
}

// Recent activity logs (self or admin)
async function getActivity(req, res) {
  try {
    const targetId = req.params.id || req.user._id;
    if (String(targetId) !== String(req.user._id) && req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findById(targetId).select('activityLogs role name gmail');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ logs: user.activityLogs.slice(-50).reverse() });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load activity', error: err.message });
  }
}

module.exports = { uploadProfileImage, getProfile, updateProfile, changePassword, getActivity };