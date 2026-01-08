const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getSpendingByCategory,
    getMonthlyTrend,
    getAccountBalances,
    getBudgetPerformance
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/spending-by-category', getSpendingByCategory);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/account-balances', getAccountBalances);
router.get('/budget-performance', getBudgetPerformance);

module.exports = router;
