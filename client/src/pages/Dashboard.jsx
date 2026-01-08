import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [spendingData, setSpendingData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashboardData, spending, trend] = await Promise.all([
                reportService.getDashboard(),
                reportService.getSpendingByCategory(),
                reportService.getMonthlyTrend({ months: 6 }),
            ]);
            setData(dashboardData);
            setSpendingData(spending.categories || []);
            setTrendData(trend || []);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                {error}
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="text-muted">Overview of your financial status</p>
                </div>
                <div className="dashboard-actions">
                    <Link to="/transactions" className="btn btn-primary">
                        <Plus size={20} />
                        Add Transaction
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-4">
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#3B82F6' }}>
                        <Wallet size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Balance</p>
                        <h2 className="stat-value">{formatCurrency(data?.totalBalance || 0)}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#10B981' }}>
                        <TrendingUp size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Monthly Income</p>
                        <h2 className="stat-value text-success">{formatCurrency(data?.monthIncome || 0)}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#EF4444' }}>
                        <TrendingDown size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Monthly Expense</p>
                        <h2 className="stat-value text-danger">{formatCurrency(data?.monthExpense || 0)}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#8B5CF6' }}>
                        <PiggyBank size={24} color="white" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Monthly Savings</p>
                        <h2 className="stat-value">{formatCurrency(data?.monthSavings || 0)}</h2>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-2">
                {/* Spending Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Spending by Category</h3>
                        <Link to="/reports" className="card-link">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    {spendingData.length > 0 ? (
                        <div className="chart-wrapper-small">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={spendingData.slice(0, 5)}
                                        dataKey="total"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                    >
                                        {spendingData.slice(0, 5).map((entry, index) => (
                                            <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mini-legend">
                                {spendingData.slice(0, 4).map((entry, index) => (
                                    <div key={index} className="mini-legend-item">
                                        <span
                                            className="mini-legend-dot"
                                            style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                                        />
                                        <span className="mini-legend-name">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>
                            No spending data yet
                        </p>
                    )}
                </div>

                {/* Monthly Trend Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Monthly Trend</h3>
                        <Link to="/reports" className="card-link">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={trendData.slice(-4)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month"
                                    tickFormatter={(value) => getMonthName(value).split(' ')[0]}
                                    stroke="#6B7280"
                                    fontSize={12}
                                />
                                <YAxis hide />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>
                            No trend data yet
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-2">
                {/* Recent Transactions */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Transactions</h3>
                        <Link to="/transactions" className="card-link">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                        <div className="transaction-list">
                            {data.recentTransactions.map((transaction) => (
                                <div key={transaction._id} className="transaction-item">
                                    <div className="transaction-info">
                                        <div
                                            className="transaction-icon"
                                            style={{ backgroundColor: transaction.category?.color || '#6B7280' }}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}
                                        </div>
                                        <div>
                                            <p className="transaction-category">{transaction.category?.name || 'Uncategorized'}</p>
                                            <p className="transaction-account text-muted">{transaction.account?.name}</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount">
                                        <p className={transaction.type === 'income' ? 'text-success' : 'text-danger'}>
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>
                            No transactions yet
                        </p>
                    )}
                </div>

                {/* Budgets */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Active Budgets</h3>
                        <Link to="/budgets" className="card-link">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    {data?.budgets && data.budgets.length > 0 ? (
                        <div className="budget-list">
                            {data.budgets.slice(0, 4).map((budget) => (
                                <div key={budget._id} className="budget-item">
                                    <div className="budget-header">
                                        <p className="budget-category">{budget.category?.name}</p>
                                        <p className="budget-amount">
                                            {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                                        </p>
                                    </div>
                                    <div className="budget-progress">
                                        <div
                                            className="budget-progress-bar"
                                            style={{
                                                width: `${Math.min(budget.percentageUsed, 100)}%`,
                                                backgroundColor: budget.percentageUsed >= budget.alertThreshold ? '#EF4444' : '#10B981',
                                            }}
                                        ></div>
                                    </div>
                                    <p className="budget-percentage text-muted">
                                        {budget.percentageUsed.toFixed(1)}% used
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>
                            No active budgets
                        </p>
                    )}
                </div>
            </div>

            {/* Accounts */}
            {data?.accounts && data.accounts.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Your Accounts</h3>
                        <Link to="/accounts" className="card-link">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-3">
                        {data.accounts.slice(0, 6).map((account) => (
                            <div key={account._id} className="account-card-mini">
                                <div className="account-card-header">
                                    <div
                                        className="account-card-icon"
                                        style={{ backgroundColor: account.color || '#3B82F6' }}
                                    >
                                        {account.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="account-card-name">{account.name}</p>
                                        <p className="account-card-type text-muted">{account.type}</p>
                                    </div>
                                </div>
                                <p className="account-card-balance">{formatCurrency(account.balance)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
