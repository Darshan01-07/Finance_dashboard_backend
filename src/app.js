// src/app.js
// This is the heart of the Express application.
// It wires together all middleware and routes.

require('dotenv').config(); // Load .env variables FIRST before anything else

const express = require('express');
const path    = require('path');
const { initializeDatabase } = require('./config/database');

const authRoutes        = require('./routes/auth.routes');
const userRoutes        = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const dashboardRoutes   = require('./routes/dashboard.routes');

// Initialize tables before handling any requests
initializeDatabase();

const app = express();

// --- Serve Frontend ---
// Serve the public/ folder as static files at the root URL
app.use(express.static(path.join(__dirname, '../public')));

// --- CORS Headers ---
// Allow requests from any origin (useful during development)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// --- Global Middleware ---
// Parse incoming JSON request bodies
app.use(express.json());

// Simple request logger (useful for development/debugging)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --- API Routes ---
// All our routes are prefixed with /api/
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- 404 Handler ---
// If no route matched, return a clean 404 response
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// --- Global Error Handler ---
// Catches any unhandled errors that were passed via next(err)
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
