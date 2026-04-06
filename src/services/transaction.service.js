// src/services/transaction.service.js
// Handles all financial record operations: create, read (with filters), update, soft-delete.

const { db } = require('../config/database');

/**
 * Create a new transaction.
 */
function createTransaction({ amount, type, category, date, notes }, createdBy) {
  const result = db
    .prepare(
      `INSERT INTO transactions (amount, type, category, date, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(amount, type, category, date, notes || null, createdBy);

  return getTransactionById(result.lastInsertRowid);
}

/**
 * Get all transactions with optional filters and pagination.
 * Filters: type, category, from (date), to (date)
 * Pagination: page, limit
 */
function getAllTransactions({ type, category, from, to, page = 1, limit = 10 } = {}) {
  // Build the query dynamically based on which filters are provided
  const conditions = ['is_deleted = 0'];
  const params = [];

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (from) {
    conditions.push('date >= ?');
    params.push(from);
  }
  if (to) {
    conditions.push('date <= ?');
    params.push(to);
  }

  const whereClause = conditions.join(' AND ');

  // Count total matching records (for pagination metadata)
  const total = db
    .prepare(`SELECT COUNT(*) as count FROM transactions WHERE ${whereClause}`)
    .get(...params).count;

  // Calculate offset for pagination
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // cap at 100
  const offset = (pageNum - 1) * limitNum;

  const rows = db
    .prepare(
      `SELECT t.*, u.name as created_by_name
       FROM transactions t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE ${whereClause}
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limitNum, offset);

  return {
    data: rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Get a single transaction by ID.
 */
function getTransactionById(id) {
  const tx = db
    .prepare(
      `SELECT t.*, u.name as created_by_name
       FROM transactions t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = ? AND t.is_deleted = 0`
    )
    .get(id);

  if (!tx) {
    const error = new Error('Transaction not found.');
    error.statusCode = 404;
    throw error;
  }
  return tx;
}

/**
 * Update a transaction (partial update — only provided fields change).
 */
function updateTransaction(id, updates) {
  getTransactionById(id); // Throws 404 if not found

  // Build SET clause dynamically from provided fields
  const allowedFields = ['amount', 'type', 'category', 'date', 'notes'];
  const setClauses = [];
  const params = [];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      params.push(updates[field]);
    }
  }

  if (setClauses.length === 0) {
    const error = new Error('No valid fields to update.');
    error.statusCode = 400;
    throw error;
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  db.prepare(`UPDATE transactions SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
  return getTransactionById(id);
}

/**
 * Soft-delete a transaction (sets is_deleted = 1, does NOT remove from DB).
 * This is important for audit trails — you can always recover the data.
 */
function deleteTransaction(id) {
  getTransactionById(id); // Throws 404 if not found or already deleted
  db
    .prepare(`UPDATE transactions SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(id);
  return { message: 'Transaction deleted successfully.' };
}

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
