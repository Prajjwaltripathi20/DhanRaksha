import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Reports.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4'];

const Reports = () => {
    const [spendingData, setSpendingData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [budgetData, setBudgetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeChart, setActiveChart] = useState('spending');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const [spending, trend, budget] = await Promise.all([
                reportService.getSpendingByCategory(),
                reportService.getMonthlyTrend({ months: 6 }),
                reportService.getBudgetPerformance(),
            ]);
            setSpendingData(spending.categories || []);
            setTrendData(trend || []);
            setBudgetData(budget || []);
        } catch (err) {
            setError('Failed to load reports');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h1>Reports</h1>
                    <p className="text-muted">Analyze your financial data</p>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Chart Navigation */}
            <div className="chart-tabs">
                <button
                    className={`chart-tab ${activeChart === 'spending' ? 'active' : ''}`}
                    onClick={() => setActiveChart('spending')}
                >
                    Spending by Category
                </button>
                <button
                    className={`chart-tab ${activeChart === 'trend' ? 'active' : ''}`}
                    onClick={() => setActiveChart('trend')}
                >
                    Monthly Trend
                </button>
                <button
                    className={`chart-tab ${activeChart === 'budget' ? 'active' : ''}`}
                    onClick={() => setActiveChart('budget')}
                >
                    Budget Performance
                </button>
            </div>

            {/* Spending by Category */}
            {activeChart === 'spending' && (
                <div className="chart-container">
                    <h2 className="chart-title">Spending by Category</h2>
                    {spendingData.length > 0 ? (
                        <div className="chart-grid">
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={spendingData}
                                            dataKey="total"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                                        >
                                            {spendingData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-legend">
                                {spendingData.map((entry, index) => (
                                    <div key={index} className="legend-item">
                                        <div
                                            className="legend-color"
                                            style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                                        />
                                        <span className="legend-name">{entry.name}</span>
                                        <span className="legend-value">{formatCurrency(entry.total)}</span>
                                        <span className="legend-percent">{entry.percentage.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-chart">
                            <p>No spending data available</p>
                        </div>
                    )}
                </div>
            )}

            {/* Monthly Trend */}
            {activeChart === 'trend' && (
                <div className="chart-container">
                    <h2 className="chart-title">Monthly Income vs Expense</h2>
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month"
                                    tickFormatter={(value) => getMonthName(value)}
                                    stroke="#6B7280"
                                />
                                <YAxis
                                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                    stroke="#6B7280"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-chart">
                            <p>No trend data available</p>
                        </div>
                    )}

                    {trendData.length > 0 && (
                        <div className="chart-container" style={{ marginTop: 'var(--spacing-xl)' }}>
                            <h3>Savings Trend</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="month"
                                        tickFormatter={(value) => getMonthName(value)}
                                        stroke="#6B7280"
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                        stroke="#6B7280"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="savings"
                                        name="Savings"
                                        stroke="#8B5CF6"
                                        strokeWidth={3}
                                        dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Budget Performance */}
            {activeChart === 'budget' && (
                <div className="chart-container">
                    <h2 className="chart-title">Budget Performance</h2>
                    {budgetData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={budgetData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                                    <YAxis
                                        type="category"
                                        dataKey="category.name"
                                        width={120}
                                        stroke="#6B7280"
                                    />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="spent" name="Spent" fill="#EF4444" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="amount" name="Budget" fill="#10B981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>

                            <div className="budget-summary">
                                {budgetData.map((budget, index) => (
                                    <div key={index} className={`budget-summary-item ${budget.isOverBudget ? 'over' : ''}`}>
                                        <div className="budget-summary-header">
                                            <span className="budget-summary-name">{budget.category?.name}</span>
                                            <span className="budget-summary-percent">{budget.percentageUsed.toFixed(0)}%</span>
                                        </div>
                                        <div className="budget-summary-bar">
                                            <div
                                                className="budget-summary-fill"
                                                style={{
                                                    width: `${Math.min(budget.percentageUsed, 100)}%`,
                                                    backgroundColor: budget.isOverBudget ? '#EF4444' : budget.isNearLimit ? '#F59E0B' : '#10B981'
                                                }}
                                            />
                                        </div>
                                        <div className="budget-summary-values">
                                            <span>{formatCurrency(budget.spent)} spent</span>
                                            <span>{formatCurrency(budget.remaining)} remaining</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-chart">
                            <p>No active budgets</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
