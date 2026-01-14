const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://dhan-raksha-three.vercel.app'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    const dbStatus = require('mongoose').connection.readyState;
    const dbStatusMap = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };

    res.json({
        message: 'DhanRaksha API is running...',
        status: 'OK',
        database: dbStatusMap[dbStatus] || 'Unknown',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
