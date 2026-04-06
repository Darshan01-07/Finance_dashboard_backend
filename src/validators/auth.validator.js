// src/validators/auth.validator.js
// Joi lets us define a "schema" — a set of rules an input must satisfy.
// If the input breaks any rule, Joi returns a clear error message.

const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  // Role is optional on register — defaults to 'viewer' if not given
  role: Joi.string().valid('viewer', 'analyst', 'admin').default('viewer'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
