// Lightweight RBAC helpers layered on top of authMiddleware
module.exports.requireRole = function(...roles) {
  return (req, res, next) => {
    try {
      const role = req.user?.role;
      if (!role) return res.status(401).json({ success: false, message: 'Not authenticated' });
      if (!roles.includes(role)) return res.status(403).json({ success: false, message: 'Forbidden for role: ' + role });
      next();
    } catch (e) {
      return res.status(500).json({ success: false, message: 'RBAC error', error: e.message });
    }
  }
}

module.exports.allowRoles = module.exports.requireRole;
