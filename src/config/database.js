// src/config/database.js
// This file sets up our SQLite database connection.
// better-sqlite3 is a synchronous (blocking) SQLite library —
// perfect for assignments since it's simple and has no callbacks/promises.

const Database = require('better-sqlite3');
const path = require('path');

// The DB file will live in the project root as "database.db"
const DB_PATH = path.join(__dirname, '../../database.db');

// Open (or create) the database file
const db = new Database(DB_PATH);

// Enable WAL mode — makes reads faster when there are concurrent writes
db.pragma('journal_mode = WAL');

// Auto-create tables if they don't exist yet.
// This runs every time the server starts — safe because of "IF NOT EXISTS".
function initializeDatabase() {
  db.exec(`
    -- Users table: stores everyone who can log in
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      password_hash TEXT  NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'viewer'
                        CHECK(role IN ('viewer', 'analyst', 'admin')),
      status      TEXT    NOT NULL DEFAULT 'active'
                        CHECK(status IN ('active', 'inactive')),
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Transactions table: stores every financial record
    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      amount      REAL    NOT NULL CHECK(amount > 0),
      type        TEXT    NOT NULL CHECK(type IN ('income', 'expense')),
      category    TEXT    NOT NULL,
      date        TEXT    NOT NULL,   -- stored as YYYY-MM-DD string
      notes       TEXT,               -- optional description
      created_by  INTEGER NOT NULL REFERENCES users(id),
      is_deleted  INTEGER NOT NULL DEFAULT 0 CHECK(is_deleted IN (0, 1)),
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Database initialized — tables are ready.');
}

module.exports = { db, initializeDatabase };
