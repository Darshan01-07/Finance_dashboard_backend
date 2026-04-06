// src/controllers/transaction.controller.js

const {
  createTransactionSchema,
  updateTransactionSchema,
} = require('../validators/transaction.validator');
const transactionService = require('../services/transaction.service');

function createTransaction(req, res) {
  const { error, value } = createTransactionSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: error.details.map((d) => d.message),
    });
  }

  try {
    const tx = transactionService.createTransaction(value, req.user.id);
    return res.status(201).json({ success: true, message: 'Transaction created.', data: tx });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

function getAllTransactions(req, res) {
  try {
    // Pass query params as filter options
    const result = transactionService.getAllTransactions(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

function getTransactionById(req, res) {
  try {
    const tx = transactionService.getTransactionById(req.params.id);
    return res.status(200).json({ success: true, data: tx });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

function updateTransaction(req, res) {
  const { error, value } = updateTransactionSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: error.details.map((d) => d.message),
    });
  }

  try {
    const tx = transactionService.updateTransaction(req.params.id, value);
    return res.status(200).json({ success: true, message: 'Transaction updated.', data: tx });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

function deleteTransaction(req, res) {
  try {
    const result = transactionService.deleteTransaction(req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
