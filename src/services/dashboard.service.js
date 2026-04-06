// src/services/dashboard.service.js
// These are the "analytics" APIs — aggregating data to show summaries.
// All queries only count non-deleted transactions.

const { db } = require('../config/database');

/**
 * Get total income, total expenses, and net balance.
 */
function getSummary() {
  const row = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
       FROM transactions
       WHERE is_deleted = 0`
    )
    .get();

  return {
    total_income: row.total_income,
    total_expenses: row.total_expenses,
    net_balance: row.total_income - row.total_expenses,
  };
}

/**
 * Get totals grouped by category, split by type.
 * Returns: [{ category, type, total }]
 */
function getCategoryTotals() {
  return db
    .prepare(
      `SELECT category, type, SUM(amount) AS total
       FROM transactions
       WHERE is_deleted = 0
       GROUP BY category, type
       ORDER BY total DESC`
    )
    .all();
}

/**
 * Get the last N transactions (default 5).
 */
function getRecentTransactions(limit = 5) {
  const n = Math.min(50, Math.max(1, parseInt(limit))); // cap between 1 and 50
  return db
    .prepare(
      `SELECT t.*, u.name as created_by_name
       FROM transactions t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.is_deleted = 0
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT ?`
    )
    .all(n);
}

/**
 * Get monthly income vs expenses for the current year.
 * Returns: [{ month: 'YYYY-MM', total_income, total_expenses, net }]
 */
function getMonthlyTrends(year) {
  const targetYear = year || new Date().getFullYear();

  const rows = db
    .prepare(
      `SELECT
        strftime('%Y-%m', date) AS month,
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
       FROM transactions
       WHERE is_deleted = 0 AND strftime('%Y', date) = ?
       GROUP BY month
       ORDER BY month ASC`
    )
    .all(String(targetYear));

  return rows.map((row) => ({
    ...row,
    net: row.total_income - row.total_expenses,
  }));
}

module.exports = { getSummary, getCategoryTotals, getRecentTransactions, getMonthlyTrends };
