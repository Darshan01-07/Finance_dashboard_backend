// src/controllers/auth.controller.js
// Controllers are thin — they only:
//   1. Validate input
//   2. Call the service
//   3. Send the response
// All real logic lives in the service layer.

const { registerSchema, loginSchema } = require('../validators/auth.validator');
const authService = require('../services/auth.service');

async function register(req, res) {
  // Validate request body against our schema
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: error.details.map((d) => d.message),
    });
  }

  try {
    const user = authService.register(value);
    return res.status(201).json({ success: true, message: 'User registered successfully.', data: user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

async function login(req, res) {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: error.details.map((d) => d.message),
    });
  }

  try {
    const result = authService.login(value);
    return res.status(200).json({ success: true, message: 'Login successful.', data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

// GET /auth/me — returns the currently logged-in user's info
// req.user is set by the authenticate middleware
function getMe(req, res) {
  return res.status(200).json({ success: true, data: req.user });
}

module.exports = { register, login, getMe };
