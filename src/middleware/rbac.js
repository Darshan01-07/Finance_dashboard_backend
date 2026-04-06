// src/middleware/rbac.js
// RBAC = Role Based Access Control
// This is a "middleware factory" — a function that RETURNS a middleware function.
//
// Usage example:
//   router.post('/', authenticate, authorize('admin'), controller.create)
//   This means: first check login, then check role is 'admin', then run controller
//
// authorize('admin', 'analyst') means EITHER role is allowed.

function authorize(...allowedRoles) {
  return (req, res, next) => {
    // req.user is set by the authenticate middleware that runs before this
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}.`,
      });
    }

    next(); // Role is allowed — proceed
  };
}

module.exports = { authorize };
