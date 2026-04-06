// src/routes/transaction.routes.js
// Different endpoints have different role requirements:
//   - GET routes: all authenticated users (viewer, analyst, admin)
//   - POST/PUT/DELETE: admin only

const express = require('express');
const router = express.Router();
const txController = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All transaction routes require login
router.use(authenticate);

// Read — available to all roles
router.get('/', txController.getAllTransactions);
router.get('/:id', txController.getTransactionById);

// Write — admin only
router.post('/', authorize('admin'), txController.createTransaction);
router.put('/:id', authorize('admin'), txController.updateTransaction);
router.delete('/:id', authorize('admin'), txController.deleteTransaction);

module.exports = router;
