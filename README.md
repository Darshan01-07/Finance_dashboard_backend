# Finance Dashboard Backend

A RESTful API backend for a finance dashboard system with role-based access control (RBAC). Built with Node.js, Express, and SQLite.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | SQLite (via `better-sqlite3`) |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcryptjs |
| Input Validation | Joi |

---

## Getting Started

### Prerequisites
- Node.js v18 or higher

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd finance-dashboard-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

# 4. Seed the database with test users and transactions
npm run seed

# 5. Start the server
npm start
```

The server will start at `http://localhost:3000`.

---

## Project Structure

```
finance-dashboard-backend/
├── src/
│   ├── config/
│   │   └── database.js        # SQLite connection + table auto-creation
│   ├── middleware/
│   │   ├── auth.js            # JWT verification — protects routes
│   │   └── rbac.js            # Role checking — controls access per role
│   ├── controllers/           # Handle HTTP request/response cycle
│   ├── services/              # Business logic and database queries
│   ├── routes/                # URL definitions + middleware chains
│   ├── validators/            # Joi schemas for input validation
│   └── app.js                 # Express app setup and server start
├── seed.js                    # Populates DB with test data
├── .env.example               # Environment variable template
└── README.md
```

**Design principle**: Each layer has one responsibility.
- `routes` → URL paths and middleware order
- `controllers` → validate input, call service, respond
- `services` → all logic, all DB queries
- `middleware` → auth and role checks that run before routes

---

## Roles and Permissions

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| Login / Register | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ |
| View recent dashboard activity | ✅ | ✅ | ✅ |
| Dashboard summary (income/expense/balance) | ❌ | ✅ | ✅ |
| Dashboard trends and category data | ❌ | ✅ | ✅ |
| Create / Update / Delete transactions | ❌ | ❌ | ✅ |
| Manage users (list, change role/status) | ❌ | ❌ | ✅ |

---

## API Reference

### Auth

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create a new account |
| `POST` | `/api/auth/login` | No | Login and receive JWT |
| `GET` | `/api/auth/me` | Yes | Get current user profile |

**Register**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "viewer"         // optional, defaults to "viewer"
}
```

**Login**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "secret123"
}
// Response includes a "token" — use it as: Authorization: Bearer <token>
```

---

### Transactions

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/transactions` | Yes | Admin | Create a transaction |
| `GET` | `/api/transactions` | Yes | All | List with filters |
| `GET` | `/api/transactions/:id` | Yes | All | Get one transaction |
| `PUT` | `/api/transactions/:id` | Yes | Admin | Update a transaction |
| `DELETE` | `/api/transactions/:id` | Yes | Admin | Soft-delete a transaction |

**Create Transaction**
```json
POST /api/transactions
{
  "amount": 85000,
  "type": "income",           // "income" or "expense"
  "category": "Salary",
  "date": "2024-01-05",       // YYYY-MM-DD format
  "notes": "January salary"  // optional
}
```

**Filter Transactions (Query Params)**
```
GET /api/transactions?type=income&category=Salary&from=2024-01-01&to=2024-12-31&page=1&limit=10
```

| Param | Description | Example |
|---|---|---|
| `type` | Filter by type | `income` or `expense` |
| `category` | Filter by category | `Salary`, `Rent` |
| `from` | Start date (inclusive) | `2024-01-01` |
| `to` | End date (inclusive) | `2024-12-31` |
| `page` | Page number | `1` |
| `limit` | Records per page (max 100) | `10` |

---

### Dashboard

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Yes | Analyst, Admin | Total income, expenses, net balance |
| `GET` | `/api/dashboard/by-category` | Yes | Analyst, Admin | Totals grouped by category |
| `GET` | `/api/dashboard/trends` | Yes | Analyst, Admin | Monthly trends (income vs expense) |
| `GET` | `/api/dashboard/recent` | Yes | All | Last N transactions |

```
GET /api/dashboard/trends?year=2024
GET /api/dashboard/recent?limit=10
```

---

### Users (Admin Only)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/users` | Yes | Admin | List all users |
| `GET` | `/api/users/:id` | Yes | Admin | Get a user |
| `PATCH` | `/api/users/:id/role` | Yes | Admin | Change role |
| `PATCH` | `/api/users/:id/status` | Yes | Admin | Activate/deactivate |
| `DELETE` | `/api/users/:id` | Yes | Admin | Delete user |

```json
PATCH /api/users/2/role
{ "role": "analyst" }

PATCH /api/users/2/status
{ "status": "inactive" }
```

---

## Response Format

All endpoints return a consistent response structure:

```json
// Success
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "What went wrong",
  "errors": ["field-level details"]  // only on validation failures
}
```

### HTTP Status Codes Used

| Code | Meaning |
|---|---|
| `200` | OK — request succeeded |
| `201` | Created — new resource created |
| `400` | Bad Request — invalid or missing input |
| `401` | Unauthorized — not logged in or invalid token |
| `403` | Forbidden — logged in but insufficient role |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — e.g., duplicate email |
| `500` | Server Error — unexpected internal error |

---

## Test Credentials (after running `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `admin123` |
| Analyst | `analyst@example.com` | `analyst123` |
| Viewer | `viewer@example.com` | `viewer123` |

---

## Key Design Decisions and Assumptions

### Soft Delete
Transactions are never permanently deleted. They are marked `is_deleted = 1` and excluded from queries. This preserves audit history — important in finance systems.

### Stateless Authentication
JWT tokens are stateless — the server does not store sessions. The user's ID and role are encoded in the token itself. On every request, the middleware verifies the token and fetches fresh user data to catch role or status changes.

### Role Model
Three fixed roles were chosen (viewer, analyst, admin) for clarity. The assignment mentioned these roles specifically, so no dynamic role system was added. This keeps implementation clean and auditable.

### SQLite for Persistence
SQLite is a file-based relational database requiring zero external setup. For an assessment context, it is an entirely valid choice. It supports full SQL, ACID transactions, and all the query patterns used here. In production, this could be swapped to PostgreSQL with minimal service-layer changes.

### Password Security
Passwords are hashed using bcrypt with a work factor of 10. Plain-text passwords are never stored or logged anywhere.

### Consistent Error Responses
All errors follow the same `{ success, message, errors? }` format so that frontend clients can handle them predictably.

---

## Optional Enhancements Included

- ✅ JWT-based authentication
- ✅ Soft delete for transactions
- ✅ Pagination with total and page metadata
- ✅ Date range and category filtering
- ✅ Input validation with structured error responses
- ✅ Seed script with realistic financial data
- ✅ `node --watch` dev mode (no nodemon needed)
- ✅ Health check endpoint at `/health`
