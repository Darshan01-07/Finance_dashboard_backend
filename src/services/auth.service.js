// src/services/auth.service.js
// Services contain the actual business logic.
// Controllers call services — services talk to the database.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

/**
 * Register a new user.
 * @returns {object} The created user (without password)
 */
function register({ name, email, password, role }) {
  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    const error = new Error('A user with this email already exists.');
    error.statusCode = 409; // 409 Conflict
    throw error;
  }

  // Hash the password — NEVER store plain-text passwords
  // bcrypt adds a "salt" (random data) before hashing so same passwords hash differently
  const password_hash = bcrypt.hashSync(password, 10); // 10 = work factor (higher = slower = safer)

  const result = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, ?)`
    )
    .run(name, email, password_hash, role || 'viewer');

  return getUserById(result.lastInsertRowid);
}

/**
 * Log in a user and return a JWT token.
 * @returns {{ user, token }}
 */
function login({ email, password }) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  // Use a generic message — don't reveal whether the email exists or not
  const invalidMsg = 'Invalid email or password.';

  if (!user) {
    const error = new Error(invalidMsg);
    error.statusCode = 401;
    throw error;
  }

  if (user.status === 'inactive') {
    const error = new Error('Your account has been deactivated. Contact an admin.');
    error.statusCode = 403;
    throw error;
  }

  // Compare the plain-text password against the stored hash
  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    const error = new Error(invalidMsg);
    error.statusCode = 401;
    throw error;
  }

  // Create a JWT token — this encodes the user's id and role
  // Anyone with the JWT_SECRET can verify this token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { password_hash: _, ...safeUser } = user; // Strip password from response
  return { user: safeUser, token };
}

/**
 * Get a user by ID (without password).
 */
function getUserById(id) {
  const user = db
    .prepare('SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ?')
    .get(id);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

module.exports = { register, login, getUserById };
