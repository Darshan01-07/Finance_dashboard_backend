// src/validators/transaction.validator.js

const Joi = require('joi');

const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().min(1).max(100).required(),
  // Date must be ISO format: YYYY-MM-DD
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({ 'string.pattern.base': 'Date must be in YYYY-MM-DD format' }),
  notes: Joi.string().max(500).allow('', null).optional(),
});

// For updates, all fields are optional (PATCH-style updates)
const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive(),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().min(1).max(100),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({ 'string.pattern.base': 'Date must be in YYYY-MM-DD format' }),
  notes: Joi.string().max(500).allow('', null),
}).min(1); // At least one field must be provided

module.exports = { createTransactionSchema, updateTransactionSchema };
