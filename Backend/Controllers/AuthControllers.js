const jwt = require('jsonwebtoken');
const signupController = require('./SignupController');
const loginController = require('./LoginController');

// Re-export signup and signin using existing controllers
exports.signup = async (req, res) => {
  return signupController.signup(req, res);
};

exports.signin = async (req, res) => {
  return loginController.login(req, res);
};

// Return authenticated user profile (populated by authMiddleware)
exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    return res.status(200).json({ success: true, user: req.user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load profile', error: err.message });
  }
};
