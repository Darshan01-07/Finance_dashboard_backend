// src/routes/auth.routes.js
// Routes define URL paths + which middleware and controller to use.
// Think of routes as the "directory" of your API.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// Public routes — no token needed
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route — token required
router.get('/me', authenticate, authController.getMe);

module.exports = router;
