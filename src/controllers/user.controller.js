// src/controllers/user.controller.js

const { updateRoleSchema, updateStatusSchema } = require('../validators/user.validator');
const userService = require('../services/user.service');

function getAllUsers(req, res) {
  try {
    const users = userService.getAllUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

function getUserById(req, res) {
  try {
    const user = userService.getUserById(req.params.id);
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

function updateRole(req, res) {
  const { error, value } = updateRoleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const user = userService.updateRole(req.params.id, value.role);
    return res.status(200).json({ success: true, message: 'Role updated.', data: user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

function updateStatus(req, res) {
  const { error, value } = updateStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const user = userService.updateStatus(req.params.id, value.status);
    return res.status(200).json({ success: true, message: 'Status updated.', data: user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

function deleteUser(req, res) {
  try {
    const result = userService.deleteUser(req.user.id, req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

module.exports = { getAllUsers, getUserById, updateRole, updateStatus, deleteUser };
