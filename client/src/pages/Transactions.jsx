import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { accountService } from '../services/accountService';
import { formatCurrency, formatDate } from '../utils/formatters';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Filter, TrendingUp, TrendingDown, Search } from 'lucide-react';
import './Transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });

    const [filters, setFilters] = useState({
        type: '',
        category: '',
        account: '',
        search: '',
    });

    const [formData, setFormData] = useState({
        type: 'expense',
        category: '',
        account: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transData, catData, accData, statsData] = await Promise.all([
                transactionService.getAll(filters),
                categoryService.getAll(),
                accountService.getAll(),
                transactionService.getStats(),
            ]);
            setTransactions(transData.transactions || []);
            setCategories(catData || []);
            setAccounts(accData.accounts || []);
            setStats(statsData);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTransaction) {
                await transactionService.update(editingTransaction._id, formData);
            } else {
                await transactionService.create(formData);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save transaction');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await transactionService.delete(id);
                fetchData();
            } catch (err) {
                setError('Failed to delete transaction');
            }
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            type: transaction.type,
            category: transaction.category?._id || '',
            account: transaction.account?._id || '',
            amount: transaction.amount,
            description: transaction.description || '',
            date: transaction.date.split('T')[0],
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            type: 'expense',
            category: '',
            account: '',
            amount: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
        });
        setEditingTransaction(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const filteredCategories = categories.filter(c => c.type === formData.type);

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading transactions...</p>
            </div>
        );
    }

    return (
        <div className="transactions-page">
            <div className="page-header">
                <div>
                    <h1>Transactions</h1>
                    <p className="text-muted">Manage your income and expenses</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={20} />
                    Add Transaction
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-mini income">
                    <TrendingUp size={20} />
                    <div>
                        <span className="stat-label">Income</span>
                        <span className="stat-value">{formatCurrency(stats.income)}</span>
                    </div>
                </div>
                <div className="stat-mini expense">
                    <TrendingDown size={20} />
                    <div>
                        <span className="stat-label">Expense</span>
                        <span className="stat-value">{formatCurrency(stats.expense)}</span>
                    </div>
                </div>
                <div className="stat-mini balance">
                    <span className="stat-label">Balance</span>
                    <span className="stat-value">{formatCurrency(stats.balance)}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        className="search-input"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Search transactions..."
                    />
                </div>
                <Filter size={20} />
                <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="form-select"
                >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="form-select"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
                <select
                    value={filters.account}
                    onChange={(e) => setFilters({ ...filters, account: e.target.value })}
                    className="form-select"
                >
                    <option value="">All Accounts</option>
                    {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>{acc.name}</option>
                    ))}
                </select>
            </div>

            {/* Transactions List */}
            <div className="card">
                {transactions.length > 0 ? (
                    <div className="transactions-list">
                        {transactions.map((transaction) => (
                            <div key={transaction._id} className="transaction-row">
                                <div className="transaction-left">
                                    <div
                                        className="transaction-icon"
                                        style={{ backgroundColor: transaction.category?.color || '#6B7280' }}
                                    >
                                        {transaction.type === 'income' ? '+' : '-'}
                                    </div>
                                    <div className="transaction-details">
                                        <p className="transaction-title">
                                            {transaction.description || transaction.category?.name || 'Transaction'}
                                        </p>
                                        <p className="transaction-meta">
                                            {transaction.category?.name} • {transaction.account?.name} • {formatDate(transaction.date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="transaction-right">
                                    <p className={`transaction-amount ${transaction.type}`}>
                                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </p>
                                    <div className="transaction-actions">
                                        <button className="btn-icon" onClick={() => handleEdit(transaction)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon danger" onClick={() => handleDelete(transaction._id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No transactions found</p>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            Add your first transaction
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <div className="type-selector">
                            <button
                                type="button"
                                className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                            >
                                Income
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="Enter amount"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Select Category</option>
                            {filteredCategories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        {filteredCategories.length === 0 && (
                            <p className="form-error">No categories found. Create one first.</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Account</label>
                        <select
                            className="form-select"
                            value={formData.account}
                            onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                            required
                        >
                            <option value="">Select Account</option>
                            {accounts.map((acc) => (
                                <option key={acc._id} value={acc._id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingTransaction ? 'Update' : 'Add'} Transaction
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Transactions;
