import { useState, useEffect } from 'react';
import { goalService } from '../services/goalService';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { COLORS } from '../utils/constants';
import './Goals.css';

const GOAL_CATEGORIES = [
    { value: 'savings', label: 'Savings' },
    { value: 'investment', label: 'Investment' },
    { value: 'emergency', label: 'Emergency Fund' },
    { value: 'vacation', label: 'Vacation' },
    { value: 'education', label: 'Education' },
    { value: 'home', label: 'Home' },
    { value: 'car', label: 'Car' },
    { value: 'other', label: 'Other' },
];

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [summary, setSummary] = useState({ totalTarget: 0, totalSaved: 0, overallProgress: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [contributeAmount, setContributeAmount] = useState('');
    const [filter, setFilter] = useState('active');

    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        deadline: '',
        category: 'savings',
        color: '#2F6F6D',
        notes: '',
    });

    useEffect(() => {
        fetchGoals();
    }, [filter]);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const data = await goalService.getAll(filter);
            setGoals(data.goals || []);
            setSummary({
                totalTarget: data.totalTarget || 0,
                totalSaved: data.totalSaved || 0,
                overallProgress: data.overallProgress || 0,
            });
        } catch (err) {
            setError('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGoal) {
                await goalService.update(editingGoal._id, formData);
            } else {
                await goalService.create(formData);
            }
            setShowModal(false);
            resetForm();
            fetchGoals();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save goal');
        }
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        if (!selectedGoal || !contributeAmount) return;

        try {
            await goalService.contribute(selectedGoal._id, parseFloat(contributeAmount));
            setShowContributeModal(false);
            setContributeAmount('');
            setSelectedGoal(null);
            fetchGoals();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add contribution');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            try {
                await goalService.delete(id);
                fetchGoals();
            } catch (err) {
                setError('Failed to delete goal');
            }
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            targetAmount: goal.targetAmount,
            deadline: goal.deadline.split('T')[0],
            category: goal.category,
            color: goal.color || '#2F6F6D',
            notes: goal.notes || '',
        });
        setShowModal(true);
    };

    const openContributeModal = (goal) => {
        setSelectedGoal(goal);
        setContributeAmount('');
        setShowContributeModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            targetAmount: '',
            deadline: '',
            category: 'savings',
            color: '#2F6F6D',
            notes: '',
        });
        setEditingGoal(null);
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading goals...</p>
            </div>
        );
    }

    return (
        <div className="goals-page">
            <div className="page-header">
                <div>
                    <h1>Financial Goals</h1>
                    <p className="text-muted">Track your savings goals</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={20} />
                    New Goal
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Summary Card */}
            <div className="goals-summary">
                <div className="summary-stat">
                    <Target size={24} />
                    <div>
                        <span className="summary-label">Total Target</span>
                        <span className="summary-value">{formatCurrency(summary.totalTarget)}</span>
                    </div>
                </div>
                <div className="summary-stat">
                    <TrendingUp size={24} />
                    <div>
                        <span className="summary-label">Total Saved</span>
                        <span className="summary-value">{formatCurrency(summary.totalSaved)}</span>
                    </div>
                </div>
                <div className="summary-stat">
                    <div className="overall-progress-ring">
                        <span>{summary.overallProgress.toFixed(0)}%</span>
                    </div>
                    <div>
                        <span className="summary-label">Overall Progress</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Active Goals
                </button>
                <button
                    className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
                <button
                    className={`filter-tab ${filter === '' ? 'active' : ''}`}
                    onClick={() => setFilter('')}
                >
                    All
                </button>
            </div>

            {/* Goals Grid */}
            <div className="goals-grid">
                {goals.length > 0 ? (
                    goals.map((goal) => (
                        <div key={goal._id} className={`goal-card ${goal.isCompleted ? 'completed' : ''}`}>
                            <div className="goal-card-header">
                                <div className="goal-icon" style={{ backgroundColor: goal.color || '#2F6F6D' }}>
                                    {goal.isCompleted ? <CheckCircle size={24} /> : <Target size={24} />}
                                </div>
                                <div className="goal-actions">
                                    {!goal.isCompleted && (
                                        <button className="btn btn-sm btn-primary" onClick={() => openContributeModal(goal)}>
                                            + Add
                                        </button>
                                    )}
                                    <button className="btn-icon" onClick={() => handleEdit(goal)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="btn-icon danger" onClick={() => handleDelete(goal._id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="goal-name">{goal.name}</h3>
                            <p className="goal-category">{goal.category}</p>

                            <div className="goal-amounts">
                                <span className="goal-current">{formatCurrency(goal.currentAmount)}</span>
                                <span className="goal-target">/ {formatCurrency(goal.targetAmount)}</span>
                            </div>

                            <div className="goal-progress-container">
                                <div className="goal-progress-bar">
                                    <div
                                        className="goal-progress-fill"
                                        style={{
                                            width: `${Math.min(goal.progress, 100)}%`,
                                            backgroundColor: goal.isCompleted ? '#4CAF50' : goal.color || '#2F6F6D',
                                        }}
                                    />
                                </div>
                                <span className="goal-percent">{goal.progress.toFixed(0)}%</span>
                            </div>

                            <div className="goal-footer">
                                <div className="goal-deadline">
                                    <Calendar size={14} />
                                    <span>{goal.daysRemaining > 0 ? `${goal.daysRemaining} days left` : 'Past deadline'}</span>
                                </div>
                                <span className="goal-remaining">
                                    {formatCurrency(goal.remaining)} to go
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <Target size={48} />
                        <p>No {filter === 'completed' ? 'completed' : 'active'} goals</p>
                        {filter !== 'completed' && (
                            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                                Create your first goal
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Goal Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Emergency Fund, Vacation Trip"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Target Amount</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.targetAmount}
                            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                            placeholder="Enter target amount"
                            required
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Deadline</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {GOAL_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Color</label>
                        <div className="color-picker">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`color-option ${formData.color === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData({ ...formData, color })}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes (Optional)</label>
                        <textarea
                            className="form-textarea"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add any notes..."
                            rows="3"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingGoal ? 'Update' : 'Create'} Goal
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Contribute Modal */}
            <Modal
                isOpen={showContributeModal}
                onClose={() => setShowContributeModal(false)}
                title={`Add to ${selectedGoal?.name || 'Goal'}`}
            >
                <form onSubmit={handleContribute}>
                    <div className="contribute-info">
                        <p>Current: <strong>{formatCurrency(selectedGoal?.currentAmount || 0)}</strong></p>
                        <p>Target: <strong>{formatCurrency(selectedGoal?.targetAmount || 0)}</strong></p>
                        <p>Remaining: <strong>{formatCurrency(selectedGoal?.remaining || 0)}</strong></p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount to Add</label>
                        <input
                            type="number"
                            className="form-input"
                            value={contributeAmount}
                            onChange={(e) => setContributeAmount(e.target.value)}
                            placeholder="Enter amount"
                            required
                            min="1"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowContributeModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Add Contribution
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Goals;
