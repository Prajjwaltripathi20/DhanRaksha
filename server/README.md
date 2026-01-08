# DhanRaksha - Financial Dashboard Backend

A comprehensive RESTful API for managing personal finances, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Transaction Management**: Track income and expenses with categories and tags
- **Account Management**: Manage multiple financial accounts (cash, bank, credit cards, etc.)
- **Budget Tracking**: Set budgets by category with spending alerts
- **Category Organization**: Organize transactions with custom categories
- **Reports & Analytics**: Dashboard overview, spending analysis, trends, and budget performance

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/dhanraksha
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start MongoDB service on your machine

5. Run the server:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/profile` | Update user profile | Private |

### Transactions (`/api/transactions`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all transactions (with filters) | Private |
| GET | `/:id` | Get single transaction | Private |
| POST | `/` | Create new transaction | Private |
| PUT | `/:id` | Update transaction | Private |
| DELETE | `/:id` | Delete transaction | Private |
| GET | `/stats` | Get transaction statistics | Private |

**Query Parameters for GET /**:
- `type`: Filter by income/expense
- `category`: Filter by category ID
- `account`: Filter by account ID
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `limit`: Number of results (default: 50)
- `page`: Page number (default: 1)

### Accounts (`/api/accounts`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all accounts | Private |
| GET | `/:id` | Get single account | Private |
| POST | `/` | Create new account | Private |
| PUT | `/:id` | Update account | Private |
| DELETE | `/:id` | Delete account | Private |

### Budgets (`/api/budgets`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all budgets | Private |
| GET | `/:id` | Get single budget | Private |
| POST | `/` | Create new budget | Private |
| PUT | `/:id` | Update budget | Private |
| DELETE | `/:id` | Delete budget | Private |

### Categories (`/api/categories`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all categories | Private |
| GET | `/:id` | Get single category | Private |
| POST | `/` | Create new category | Private |
| PUT | `/:id` | Update category | Private |
| DELETE | `/:id` | Delete category | Private |

### Reports (`/api/reports`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Get dashboard overview | Private |
| GET | `/spending-by-category` | Get spending breakdown by category | Private |
| GET | `/monthly-trend` | Get monthly income/expense trends | Private |
| GET | `/account-balances` | Get account balance history | Private |
| GET | `/budget-performance` | Get budget performance data | Private |

## Data Models

### User
- name, email, password (hashed)
- avatar, currency
- timestamps

### Transaction
- user, type (income/expense)
- category, account, amount
- description, date, tags
- isRecurring, recurringFrequency
- timestamps

### Account
- user, name, type
- balance, currency
- color, icon, description
- isActive
- timestamps

### Budget
- user, category, amount, spent
- period (weekly/monthly/yearly)
- startDate, endDate
- alertThreshold, isActive
- timestamps
- Virtual fields: remaining, percentageUsed

### Category
- user, name, type (income/expense)
- icon, color
- isDefault, isActive
- timestamps

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is returned upon successful registration or login.

## Error Handling

The API uses standard HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Server Error

Error responses include a message field:
```json
{
  "message": "Error description"
}
```

## Features in Detail

### Transaction Management
- Automatically updates account balances
- Updates budget spent amounts for expenses
- Supports recurring transactions
- Pagination and filtering

### Budget Tracking
- Prevents overlapping budgets for same category
- Calculates remaining budget and percentage used
- Alert threshold for spending warnings
- Automatic spent amount tracking

### Reports & Analytics
- Dashboard with total balance, monthly income/expense
- Spending breakdown by category with percentages
- Monthly trends for income, expense, and savings
- Account balance history over time
- Budget performance with alerts

## Development

The server uses:
- `nodemon` for auto-restart during development
- Environment-based configuration
- Mongoose for MongoDB operations
- bcryptjs for password hashing
- JWT for authentication

## License

ISC
