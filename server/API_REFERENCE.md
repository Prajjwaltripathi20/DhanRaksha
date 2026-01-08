# DhanRaksha API - Quick Reference

Base URL: `http://localhost:5001/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

## Endpoints

### 🔐 Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "currency": "USD",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

### 📁 Categories

#### Get All Categories
```http
GET /categories?type=expense&isActive=true
Authorization: Bearer <token>
```

#### Create Category
```http
POST /categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Food & Dining",
  "type": "expense",
  "icon": "restaurant",
  "color": "#EF4444"
}
```

#### Update Category
```http
PUT /categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "color": "#10B981"
}
```

#### Delete Category
```http
DELETE /categories/:id
Authorization: Bearer <token>
```

---

### 💰 Accounts

#### Get All Accounts
```http
GET /accounts?isActive=true
Authorization: Bearer <token>
```

#### Create Account
```http
POST /accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Main Wallet",
  "type": "cash",
  "balance": 10000,
  "currency": "INR",
  "color": "#10B981",
  "icon": "wallet",
  "description": "My primary cash account"
}
```

**Account Types**: `cash`, `bank`, `credit_card`, `investment`, `loan`, `other`

#### Update Account
```http
PUT /accounts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Wallet",
  "balance": 15000
}
```

#### Delete Account
```http
DELETE /accounts/:id
Authorization: Bearer <token>
```

---

### 💸 Transactions

#### Get All Transactions
```http
GET /transactions?type=expense&startDate=2026-01-01&endDate=2026-01-31&limit=50&page=1
Authorization: Bearer <token>
```

**Query Parameters**:
- `type`: `income` or `expense`
- `category`: Category ID
- `account`: Account ID
- `startDate`: ISO date string
- `endDate`: ISO date string
- `limit`: Number of results (default: 50)
- `page`: Page number (default: 1)

#### Create Transaction
```http
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "category": "695dfd3ab4505547c8b3e065",
  "account": "695dfd3ab4505547c8b3e068",
  "amount": 500,
  "description": "Lunch at restaurant",
  "date": "2026-01-07T12:00:00Z",
  "tags": ["food", "dining"],
  "isRecurring": false
}
```

#### Update Transaction
```http
PUT /transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 600,
  "description": "Updated description"
}
```

#### Delete Transaction
```http
DELETE /transactions/:id
Authorization: Bearer <token>
```

#### Get Transaction Statistics
```http
GET /transactions/stats?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

**Response**:
```json
{
  "income": 50000,
  "expense": 30000,
  "incomeCount": 5,
  "expenseCount": 25,
  "balance": 20000
}
```

---

### 📊 Budgets

#### Get All Budgets
```http
GET /budgets?isActive=true&period=monthly
Authorization: Bearer <token>
```

#### Create Budget
```http
POST /budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "695dfd3ab4505547c8b3e065",
  "amount": 5000,
  "period": "monthly",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-01-31T23:59:59Z",
  "alertThreshold": 80
}
```

**Period Options**: `weekly`, `monthly`, `yearly`

#### Update Budget
```http
PUT /budgets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 6000,
  "alertThreshold": 75
}
```

#### Delete Budget
```http
DELETE /budgets/:id
Authorization: Bearer <token>
```

---

### 📈 Reports & Analytics

#### Dashboard Overview
```http
GET /reports/dashboard
Authorization: Bearer <token>
```

**Response**:
```json
{
  "totalBalance": 50000,
  "monthIncome": 30000,
  "monthExpense": 15000,
  "monthSavings": 15000,
  "recentTransactions": [...],
  "budgets": [...],
  "accounts": [...]
}
```

#### Spending by Category
```http
GET /reports/spending-by-category?type=expense&startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

**Response**:
```json
{
  "categories": [
    {
      "_id": "...",
      "name": "Food & Dining",
      "icon": "restaurant",
      "color": "#EF4444",
      "total": 5000,
      "count": 10,
      "percentage": 33.33
    }
  ],
  "total": 15000
}
```

#### Monthly Trend
```http
GET /reports/monthly-trend?months=6
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "month": "2026-01",
    "income": 30000,
    "expense": 15000,
    "savings": 15000
  }
]
```

#### Account Balances
```http
GET /reports/account-balances
Authorization: Bearer <token>
```

#### Budget Performance
```http
GET /reports/budget-performance
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "_id": "...",
    "category": {...},
    "amount": 5000,
    "spent": 4200,
    "remaining": 800,
    "percentageUsed": 84,
    "period": "monthly",
    "alertThreshold": 80,
    "isOverBudget": false,
    "isNearLimit": true
  }
]
```

---

## Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Server Error

## Error Response Format

```json
{
  "message": "Error description"
}
```

---

## Example Usage with cURL

### Register a User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a Transaction
```bash
curl -X POST http://localhost:5001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "expense",
    "category": "CATEGORY_ID",
    "account": "ACCOUNT_ID",
    "amount": 500,
    "description": "Lunch"
  }'
```

### Get Dashboard
```bash
curl -X GET http://localhost:5001/api/reports/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
