// src/routes/user.routes.js
// All routes here require: (1) valid JWT, (2) admin role

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All user management routes are admin-only
router.use(authenticate, authorize('admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/role', userController.updateRole);
router.patch('/:id/status', userController.updateStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
