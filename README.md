# 💰 DhanRaksha — Personal Finance Dashboard & Goal Tracker

DhanRaksha is a modern, premium personal finance desktop web application optimized for tracking, managing, and visualizing personal finances with clarity and control. Tailored for users in India and worldwide, DhanRaksha combines an intuitive financial overview, granular transaction logs, smart budgeting constraints, goals-oriented savings plans, and interactive visual reports into a single, clean dashboard interface.

---

## 🚀 Live Demo & Deployment

- **Frontend Deployment**: Configured for hosting on platforms like Vercel/Netlify.
- **Backend Service**: Configured to run on Express & Node.js, deployed to Vercel/Render.

---

## 🌟 Key Features

### 1. 🏠 Comprehensive Dashboard
* **Real-time Overview**: Get an immediate snapshot of your financial health with cards showing **Total Balance**, **Monthly Income**, **Monthly Expenses**, and **Net Savings**.
* **Visual Insights**: Interactive charts showing spending vs. income over time and current month categories breakdown.
* **Recent Activity**: Quick view of the latest transactions.

### 2. 💸 Detailed Transaction Management
* **Dual Classifications**: Distinguish clearly between Income and Expenses.
* **Smart Parameters**: Attach amount, date, description, categories, and custom tags.
* **Recurring Transactions**: Set up automatic recurring transactions with specified frequencies.
* **Granular Filters**: Search and filter transactions by type, category, account, tags, and custom date ranges.
* **Pagination**: Smooth listing controls for browsing large transaction histories.

### 3. 🏦 Multi-Account Management
* **Account Types**: Support for multiple account types, including Cash, Bank Accounts, Credit Cards, and E-wallets.
* **Net Worth Aggregator**: Automatically aggregates and displays your total balance across all active accounts.
* **Interactive Controls**: Customize colors and icons for each account, edit balances, or deactivate accounts when no longer in use.

### 4. 📊 Smart Budgeting
* **Category Limits**: Set monthly, weekly, or yearly spending budgets for specific categories.
* **Usage Indicators**: Dynamic progress bars showing the percentage of budget used and remaining funds.
* **Threshold Alerts**: Visual warnings (e.g. orange/red color changes) when spending exceeds predefined alert thresholds (e.g., 80% or 90% of the limit).

### 5. 🎯 Savings Goals Tracker
* **Goal Setup**: Establish concrete savings goals (e.g., Emergency Fund, Vacation, Investments, Home, Car, Education) with target amounts, notes, custom colors, and deadlines.
* **Dynamic Contributions**: Add money directly to your goals from your account balances.
* **Progress Diagnostics**: Live completion percentages, radial progress indicators, and automated calculations for days remaining.

### 6. 📈 Advanced Reports & Analytics
* **Interactive Charts**: Rendered with **Recharts** for a premium look and feel.
* **Key Visualizations**:
  - Category-wise expense breakdown (pie chart/donut chart).
  - Monthly income vs. expense comparison (bar charts).
  - Historical account balance trends (area charts).
  - Budget performance comparisons.

### 7. 🔑 Authentication & Profiles
* **JWT Authentication**: Full signup, login, and authorization system using JSON Web Tokens.
* **Profile Settings**: Update personal information, security passwords, and preferred currency formats (support for Indian Rupee - ₹, USD, etc.).

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend Framework** | React.js (Vite) | Fast, modern frontend build tool |
| **Routing** | React Router DOM v6 | Clean client-side routing |
| **HTTP Client** | Axios | Promise-based HTTP client for API requests |
| **Data Visualization** | Recharts | Dynamic, responsive charting library |
| **Icons** | Lucide React | Clean, modern vector icon set |
| **Styling** | Vanilla CSS3 | Custom premium UI with modern glassmorphism and transitions |
| **Backend Runtime** | Node.js | Fast, asynchronous JavaScript runtime |
| **Web Framework** | Express.js | Standard minimalist web framework |
| **Database** | MongoDB & Mongoose | Flexible NoSQL document database with Mongoose ODM |
| **Security** | JSON Web Tokens (JWT) & bcryptjs | Token-based auth and secure password hashing |

---

## 📁 Project Structure

```text
DhanRaksha/
├── client/                     # Frontend Application (Vite + React)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── components/         # Reusable layouts, Modals, Navbar, Sidebar
│   │   ├── context/            # AuthContext for login/registration state
│   │   ├── pages/              # Primary pages (Dashboard, Accounts, Budgets, Goals, Reports, etc.)
│   │   ├── services/           # Axios API wrappers (authService, transactionService, etc.)
│   │   ├── utils/              # Helper functions, formatters, and constants
│   │   ├── App.jsx             # Main routing configuration
│   │   ├── index.css           # Global CSS variables, custom reset, and utility classes
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── vite.config.js          # Vite configuration
│   └── vercel.json             # Frontend deployment configuration
│
├── server/                     # Backend API Server (Node + Express)
│   ├── config/                 # Database connection settings
│   ├── controllers/            # Request handlers (auth, transaction, goal, report controllers)
│   ├── middleware/             # Route guards (auth, error-handling middleware)
│   ├── models/                 # Mongoose schemas (User, Transaction, Account, Budget, Goal, Category)
│   ├── routes/                 # Express API routes (authRoutes, transactionRoutes, etc.)
│   ├── addDefaultCategories.js # Seed script for categories database population
│   ├── index.js                # App server entry point
│   ├── package.json
│   └── vercel.json             # Backend deployment configuration
│
└── README.md                   # Global application documentation (this file)
```

---

## ⚙️ Configuration & Environment Variables

### Backend (`server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dhanraksha
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend (`client/.env`)
Create a `.env` file inside the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas URI)

### Setup Steps

#### Step 1: Clone the Repository
Clone the project from GitHub and navigate to the project directory:
```bash
git clone https://github.com/Prajjwaltripathi20/DhanRaksha.git
cd DhanRaksha
```

#### Step 2: Database Setup
1. Start your local MongoDB server:
   ```bash
   mongod
   ```

#### Step 3: Backend Setup
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize default system categories (highly recommended for initial launch):
   ```bash
   node addDefaultCategories.js
   ```
4. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   *The server runs at:* `http://localhost:5000`

#### Step 4: Frontend Setup
1. Navigate to the `client/` directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client application:
   ```bash
   npm run dev
   ```
   *Open in browser:* `http://localhost:5173`

---

## 📡 API Reference Summary

All protected endpoints require sending a bearer token in the headers: `Authorization: Bearer <your_jwt_token>`

### 🔑 Authentication (`/api/auth`)
* `POST /api/auth/register` — Create a new user account.
* `POST /api/auth/login` — Sign in and get a JWT token.
* `GET /api/auth/me` — Retrieve current authenticated user profile.
* `PUT /api/auth/profile` — Update user profile details.

### 💸 Transactions (`/api/transactions`)
* `GET /api/transactions/` — Retrieve user transactions (supports filters: `type`, `category`, `account`, `startDate`, `endDate`, `limit`, `page`).
* `GET /api/transactions/:id` — Get details of a single transaction.
* `POST /api/transactions/` — Record a new transaction (updates account balance & budget).
* `PUT /api/transactions/:id` — Modify a transaction.
* `DELETE /api/transactions/:id` — Remove a transaction (reverts account balance & budget).

### 🏦 Accounts (`/api/accounts`)
* `GET /api/accounts/` — List all active accounts.
* `POST /api/accounts/` — Add a new account (e.g., Bank Account, Credit Card).
* `PUT /api/accounts/:id` — Edit account details or update balance.
* `DELETE /api/accounts/:id` — Remove an account.

### 📊 Budgets (`/api/budgets`)
* `GET /api/budgets/` — List all active budgets.
* `POST /api/budgets/` — Set a category budget limit.
* `PUT /api/budgets/:id` — Modify budget limit or alert thresholds.
* `DELETE /api/budgets/:id` — Delete a budget.

### 🎯 Goals (`/api/goals`)
* `GET /api/goals/` — Get savings goals (filters: `active`, `completed`, `all`).
* `POST /api/goals/` — Create a new savings target.
* `PUT /api/goals/:id` — Update goal details.
* `POST /api/goals/:id/contribute` — Add a savings contribution towards a goal.
* `DELETE /api/goals/:id` — Remove a savings goal.

### 📈 Reports (`/api/reports`)
* `GET /api/reports/dashboard` — Net balances, current month summaries.
* `GET /api/reports/spending-by-category` — Category percentage breakdowns.
* `GET /api/reports/monthly-trend` — Historical monthly comparisons.
* `GET /api/reports/account-balances` — Account balances history.
* `GET /api/reports/budget-performance` — Current budgets vs actual spend.

---

## 🎨 Design Theme & Styling
DhanRaksha uses custom hand-crafted CSS styles centered around:
* **Color Palette**: Dark teal branding (`#2F6F6D`), emerald green (`#10B981`) for income, crimson (`#EF4444`) for expenses, soft secondary backgrounds, and modern dark modes.
* **Component Styling**: Glassmorphic modal templates, shadow-drop borders, interactive side navigation bars, and smooth transitions on hover.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
