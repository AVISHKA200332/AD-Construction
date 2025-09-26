const jwt = require('jsonwebtoken');
const User = require('../Model/UserAuthModel');

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authorization token missing' });
    }

    const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
    const decoded = jwt.verify(token, secret);

    // Fetch user info for profile endpoints
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: err.message });
  }
};
