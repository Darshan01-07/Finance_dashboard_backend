// seed.js
// Run this script ONCE to populate the database with test data.
// Command: node seed.js
//
// It creates:
//   - 1 admin user
//   - 1 analyst user
//   - 1 viewer user
//   - 20 sample transactions across different categories and months

require('dotenv').config();

const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('./src/config/database');

initializeDatabase();

console.log('🌱 Seeding database...\n');

// --- Clear existing data ---
db.exec(`DELETE FROM transactions; DELETE FROM users;`);

// --- Create test users ---
const users = [
  { name: 'Alice Admin',    email: 'admin@example.com',    password: 'admin123',    role: 'admin'    },
  { name: 'Ana Analyst',    email: 'analyst@example.com',  password: 'analyst123',  role: 'analyst'  },
  { name: 'Victor Viewer',  email: 'viewer@example.com',   password: 'viewer123',   role: 'viewer'   },
];

const insertUser = db.prepare(
  `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`
);

const userIds = {};
for (const u of users) {
  const hash = bcrypt.hashSync(u.password, 10);
  const result = insertUser.run(u.name, u.email, hash, u.role);
  userIds[u.role] = result.lastInsertRowid;
  console.log(`✅ Created ${u.role}: ${u.email} / ${u.password}`);
}

// --- Create sample transactions ---
const transactions = [
  { amount: 85000, type: 'income',  category: 'Salary',       date: '2024-01-05', notes: 'January salary' },
  { amount: 12000, type: 'expense', category: 'Rent',          date: '2024-01-10', notes: 'Monthly rent' },
  { amount: 3500,  type: 'expense', category: 'Food',          date: '2024-01-15', notes: 'Groceries' },
  { amount: 2000,  type: 'expense', category: 'Transport',     date: '2024-01-20', notes: 'Fuel and cab' },
  { amount: 85000, type: 'income',  category: 'Salary',        date: '2024-02-05', notes: 'February salary' },
  { amount: 12000, type: 'expense', category: 'Rent',          date: '2024-02-10', notes: 'Monthly rent' },
  { amount: 15000, type: 'income',  category: 'Freelance',     date: '2024-02-18', notes: 'Design project' },
  { amount: 4500,  type: 'expense', category: 'Food',          date: '2024-02-22', notes: 'Dining out' },
  { amount: 85000, type: 'income',  category: 'Salary',        date: '2024-03-05', notes: 'March salary' },
  { amount: 12000, type: 'expense', category: 'Rent',          date: '2024-03-10', notes: 'Monthly rent' },
  { amount: 8000,  type: 'expense', category: 'Utilities',     date: '2024-03-12', notes: 'Electricity bill' },
  { amount: 5000,  type: 'expense', category: 'Entertainment', date: '2024-03-20', notes: 'Netflix, Spotify' },
  { amount: 20000, type: 'income',  category: 'Bonus',         date: '2024-03-25', notes: 'Q1 performance bonus' },
  { amount: 85000, type: 'income',  category: 'Salary',        date: '2024-04-05', notes: 'April salary' },
  { amount: 12000, type: 'expense', category: 'Rent',          date: '2024-04-10', notes: 'Monthly rent' },
  { amount: 3000,  type: 'expense', category: 'Health',        date: '2024-04-14', notes: 'Gym membership' },
  { amount: 10000, type: 'income',  category: 'Freelance',     date: '2024-04-18', notes: 'SEO consulting' },
  { amount: 6000,  type: 'expense', category: 'Shopping',      date: '2024-04-22', notes: 'New shoes, clothes' },
  { amount: 85000, type: 'income',  category: 'Salary',        date: '2024-05-05', notes: 'May salary' },
  { amount: 12000, type: 'expense', category: 'Rent',          date: '2024-05-10', notes: 'Monthly rent' },
];

const insertTx = db.prepare(
  `INSERT INTO transactions (amount, type, category, date, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)`
);

for (const tx of transactions) {
  insertTx.run(tx.amount, tx.type, tx.category, tx.date, tx.notes, userIds['admin']);
}

console.log(`\n✅ Created ${transactions.length} sample transactions`);
console.log('\n🎉 Seed complete! You can now start the server with: npm start\n');
console.log('Test credentials:');
console.log('  Admin:   admin@example.com   / admin123');
console.log('  Analyst: analyst@example.com / analyst123');
console.log('  Viewer:  viewer@example.com  / viewer123');
