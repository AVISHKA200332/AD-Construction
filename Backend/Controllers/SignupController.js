const User = require('../Model/UserModel'); // Changed from UserAuthModel
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { name, gmail, password } = req.body; // Changed from email to gmail, removed role
    if (!name || !gmail || !password) {
      return res.status(400).json({ success: false, message: 'Full name, gmail, and password are required' });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ gmail: gmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this gmail' });
    }
    // Create new user with default role "Client"
    const user = new User({
      name: name.trim(),
      gmail: gmail.toLowerCase(),
      password,
      role: 'Client' // Default role for signup
    });
    await user.save();
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'your-fallback-secret-key', { expiresIn: '7d' });
    res.status(201).json({
      success: true,
      message: 'User created successfully',
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
    res.status(500).json({ success: false, message: 'Signup failed', error: err.message });
  }
};
