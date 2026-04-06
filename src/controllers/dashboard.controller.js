// src/controllers/dashboard.controller.js

const dashboardService = require('../services/dashboard.service');

function getSummary(req, res) {
  try {
    const summary = dashboardService.getSummary();
    return res.status(200).json({ success: true, data: summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function getCategoryTotals(req, res) {
  try {
    const totals = dashboardService.getCategoryTotals();
    return res.status(200).json({ success: true, data: totals });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function getRecentTransactions(req, res) {
  try {
    const limit = req.query.limit || 5;
    const recent = dashboardService.getRecentTransactions(limit);
    return res.status(200).json({ success: true, data: recent });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function getMonthlyTrends(req, res) {
  try {
    const year = req.query.year;
    const trends = dashboardService.getMonthlyTrends(year);
    return res.status(200).json({ success: true, data: trends });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getSummary, getCategoryTotals, getRecentTransactions, getMonthlyTrends };
