const crypto = require('crypto');
const User = require('../Model/UserModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// POST /password/forgot
exports.forgotPassword = async (req, res) => {
  try {
    const { gmail } = req.body;
    if (!gmail) return res.status(400).json({ success: false, message: 'Gmail is required' });

    const normalizedGmail = String(gmail).trim().toLowerCase();
    const user = await User.findOne({ gmail: normalizedGmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'This account not exists' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Attempt to send email if SMTP settings exist
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: smtpPort,
          secure:
            process.env.SMTP_SECURE
              ? process.env.SMTP_SECURE === 'true'
              : smtpPort === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: String(process.env.SMTP_PASS || '').replace(/\s+/g, ''),
          },
        });

        const mailRes = await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: normalizedGmail,
          subject: 'AD Construction - Password reset',
          text: `You requested a password reset. Use the link below to reset your password (valid 1 hour):\n\n${resetLink}\n\nIf you did not request this, ignore this email.`,
          html: `<p>You requested a password reset. Click the link below to reset your password (valid 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, ignore this email.</p>`
        });

        return res.status(200).json({ success: true, message: 'Password reset email sent. Check your gmail.' });
      } catch (mailErr) {
        console.error('Failed to send reset email:', mailErr);
        return res.status(500).json({ success: false, message: 'Could not send reset email' });
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Email service is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM in Backend/.env',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Unable to process request' });
  }
};

// POST /password/reset
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token and new password are required' });

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = password; // will be hashed by pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Optionally return a new JWT
    const newToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'your-fallback-secret-key', { expiresIn: '7d' });

    return res.status(200).json({ success: true, message: 'Password reset successful', token: newToken });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Unable to reset password' });
  }
};
