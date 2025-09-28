const User = require('../Model/UserModel'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
  try {
    const { gmail, password } = req.body; 
    if (!gmail || !password) {
      return res.status(400).json({ success: false, message: 'Gmail and password are required' });
    }
    
    const user = await User.findOne({ gmail: gmail.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid gmail or password' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid gmail or password' });
    }
    
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'your-fallback-secret-key', { expiresIn: '7d' });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      loginTime: new Date(),
      token,
      user: {
        _id: user._id,
        name: user.name,
        gmail: user.gmail, 
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
};
