// src/middleware/auth.js
// This middleware runs BEFORE any protected route handler.
// It checks: "Does this request have a valid JWT token?"
// If yes → attaches the user object to req.user and calls next()
// If no  → immediately responds with 401 Unauthorized

const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

function authenticate(req, res, next) {
  // Tokens are sent in the "Authorization" header as: "Bearer <token>"
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  try {
    // jwt.verify() decodes the token and checks it hasn't been tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data from DB (in case role/status changed since token was issued)
    const user = db
      .prepare('SELECT id, name, email, role, status FROM users WHERE id = ?')
      .get(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact an admin.',
      });
    }

    req.user = user; // Make user available in all subsequent route handlers
    next();           // Pass control to the next function in the chain
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = { authenticate };
