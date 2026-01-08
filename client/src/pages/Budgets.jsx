import { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { BUDGET_PERIODS } from '../utils/constants';
import './Budgets.css';

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        alertThreshold: 80,
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Auto-calculate end date based on period and start date
        if (formData.startDate && formData.period) {
            const start = new Date(formData.startDate);
            let end;
            switch (formData.period) {
                case 'weekly':
                    end = new Date(start);
                    end.setDate(start.getDate() + 6);
                    break;
                case 'monthly':
                    end = new Date(start);
                    end.setMonth(start.getMonth() + 1);
                    end.setDate(end.getDate() - 1);
                    break;
                case 'yearly':
                    end = new Date(start);
                    end.setFullYear(start.getFullYear() + 1);
                    end.setDate(end.getDate() - 1);
                    break;
                default:
                    end = start;
            }
            setFormData(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }));
        }
    }, [formData.startDate, formData.period]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [budgetData, catData] = await Promise.all([
                budgetService.getAll(),
                categoryService.getAll({ type: 'expense' }),
            ]);
            setBudgets(budgetData || []);
            setCategories(catData.filter(c => c.type === 'expense') || []);
        } catch (err) {
            setError('Failed to load budgets');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBudget) {
                await budgetService.update(editingBudget._id, formData);
            } else {
                await budgetService.create(formData);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save budget');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await budgetService.delete(id);
                fetchData();
            } catch (err) {
                setError('Failed to delete budget');
            }
        }
    };

    const handleEdit = (budget) => {
        setEditingBudget(budget);
        setFormData({
            category: budget.category?._id || '',
            amount: budget.amount,
            period: budget.period,
            startDate: budget.startDate.split('T')[0],
            endDate: budget.endDate.split('T')[0],
            alertThreshold: budget.alertThreshold,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setFormData({
            category: '',
            amount: '',
            period: 'monthly',
            startDate: today.toISOString().split('T')[0],
            endDate: endOfMonth.toISOString().split('T')[0],
            alertThreshold: 80,
        });
        setEditingBudget(null);
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading budgets...</p>
            </div>
        );
    }

    return (
        <div className="budgets-page">
            <div className="page-header">
                <div>
                    <h1>Budgets</h1>
                    <p className="text-muted">Set and track your spending limits</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={20} />
                    Add Budget
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Budgets Grid */}
            <div className="budgets-grid">
                {budgets.length > 0 ? (
                    budgets.map((budget) => {
                        const percentUsed = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                        const isOverBudget = percentUsed > 100;
                        const isNearLimit = percentUsed >= budget.alertThreshold;

                        return (
                            <div key={budget._id} className={`budget-card ${isOverBudget ? 'over-budget' : ''}`}>
                                <div className="budget-card-header">
                                    <div
                                        className="budget-category-icon"
                                        style={{ backgroundColor: budget.category?.color || '#6B7280' }}
                                    >
                                        {budget.category?.name?.charAt(0) || 'B'}
                                    </div>
                                    <div className="budget-actions">
                                        <button className="btn-icon" onClick={() => handleEdit(budget)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon danger" onClick={() => handleDelete(budget._id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="budget-category-name">{budget.category?.name || 'Category'}</h3>
                                <p className="budget-period">{budget.period}</p>

                                <div className="budget-amounts">
                                    <span className="budget-spent">{formatCurrency(budget.spent)}</span>
                                    <span className="budget-separator">of</span>
                                    <span className="budget-total">{formatCurrency(budget.amount)}</span>
                                </div>

                                <div className="budget-progress-container">
                                    <div className="budget-progress-bar">
                                        <div
                                            className={`budget-progress-fill ${isOverBudget ? 'danger' : isNearLimit ? 'warning' : 'normal'}`}
                                            style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                        />
                                    </div>
                                    <span className="budget-percent">{percentUsed.toFixed(0)}%</span>
                                </div>

                                {isNearLimit && !isOverBudget && (
                                    <div className="budget-alert warning">
                                        <AlertTriangle size={16} />
                                        <span>Approaching limit</span>
                                    </div>
                                )}

                                {isOverBudget && (
                                    <div className="budget-alert danger">
                                        <AlertTriangle size={16} />
                                        <span>Over budget!</span>
                                    </div>
                                )}

                                <div className="budget-remaining">
                                    <span>Remaining: </span>
                                    <strong style={{ color: budget.amount - budget.spent >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {formatCurrency(budget.amount - budget.spent)}
                                    </strong>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <p>No budgets set</p>
                        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                            Create your first budget
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingBudget ? 'Edit Budget' : 'Add Budget'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <p className="form-error">No expense categories found. Create one first.</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Budget Amount</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="Enter budget amount"
                            required
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Period</label>
                        <select
                            className="form-select"
                            value={formData.period}
                            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                            required
                        >
                            {BUDGET_PERIODS.map((period) => (
                                <option key={period.value} value={period.value}>{period.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Alert Threshold (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.alertThreshold}
                            onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                            placeholder="80"
                            min="1"
                            max="100"
                        />
                        <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: 'var(--spacing-xs)' }}>
                            Get alerted when spending reaches this percentage
                        </p>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingBudget ? 'Update' : 'Add'} Budget
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Budgets;
