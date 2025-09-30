const jwt = require('jsonwebtoken');
const User = require('../Model/UserModel');

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
    const payload = jwt.verify(token, secret);

    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found for token' });

    req.user = {
      _id: user._id,
      id: String(user._id),
      name: user.name,
      gmail: user.gmail,
      role: user.role
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: err.message });
  }
};
