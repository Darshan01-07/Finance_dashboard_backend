// src/routes/dashboard.routes.js
// Dashboard access levels:
//   - /recent   → all authenticated users (viewer, analyst, admin)
//   - all others → analyst and admin only

const express = require('express');
const router = express.Router();
const dashController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(authenticate); // All dashboard routes require login

// All roles can see recent activity
router.get('/recent', dashController.getRecentTransactions);

// Deeper analytics: analyst and admin only
router.get('/summary', authorize('analyst', 'admin'), dashController.getSummary);
router.get('/by-category', authorize('analyst', 'admin'), dashController.getCategoryTotals);
router.get('/trends', authorize('analyst', 'admin'), dashController.getMonthlyTrends);

module.exports = router;
