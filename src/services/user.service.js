// src/services/user.service.js
// Admin-only operations: list users, update role, update status, delete.

const { db } = require('../config/database');

const SAFE_USER_FIELDS = `id, name, email, role, status, created_at, updated_at`;

function getAllUsers() {
  return db.prepare(`SELECT ${SAFE_USER_FIELDS} FROM users ORDER BY created_at DESC`).all();
}

function getUserById(id) {
  const user = db.prepare(`SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`).get(id);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

function updateRole(id, role) {
  const user = getUserById(id); // Throws 404 if not found
  db.prepare(`UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(role, id);
  return getUserById(id);
}

function updateStatus(id, status) {
  getUserById(id); // Throws 404 if not found
  db.prepare(`UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, id);
  return getUserById(id);
}

function deleteUser(requestingUserId, targetId) {
  // Prevent an admin from deleting themselves
  if (requestingUserId === parseInt(targetId)) {
    const error = new Error('You cannot delete your own account.');
    error.statusCode = 400;
    throw error;
  }
  getUserById(targetId); // Throws 404 if not found
  db.prepare(`DELETE FROM users WHERE id = ?`).run(targetId);
  return { message: 'User deleted successfully.' };
}

module.exports = { getAllUsers, getUserById, updateRole, updateStatus, deleteUser };
