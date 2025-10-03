const User = require('../Model/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { inferRoleFromEmail } = require('../utils/roleUtils');

// Login controller
exports.login = async (req, res) => {
  try {
    const { gmail, password } = req.body; // Changed from email to gmail
    if (!gmail || !password) {
      return res.status(400).json({ success: false, message: 'Gmail and password are required' });
    }
    // Find user by gmail
    const user = await User.findOne({ gmail: gmail.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid gmail or password' });
    }
  // Compare password directly
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid gmail or password' });
    }
    // Auto-heal role if empty or legacy mismatch
    if (!user.role) {
      user.role = inferRoleFromEmail(user.gmail);
    }
    user.lastLogin = new Date();
    await user.save();
    user.addActivity('USER_LOGIN', { from: 'credentials' });
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'your-fallback-secret-key', { expiresIn: '7d' });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      loginTime: new Date(),
      token,
      user: {
        _id: user._id,
        name: user.name,
        gmail: user.gmail, // Changed from email to gmail
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
};
