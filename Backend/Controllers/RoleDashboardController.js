// Basic role-based dashboard placeholders
exports.getDashboard = async (req, res) => {
  try {
    const role = req.user?.role;
    res.json({ success: true, role, message: `${role} dashboard endpoint placeholder` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load dashboard', error: err.message });
  }
};
