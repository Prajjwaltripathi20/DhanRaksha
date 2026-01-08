import { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Wallet, Building2, CreditCard, TrendingUp, ArrowDownCircle, ArrowRightLeft } from 'lucide-react';
import { ACCOUNT_TYPES, COLORS } from '../utils/constants';
import './Accounts.css';

const Accounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'cash',
        balance: '',
        color: '#2F6F6D',
        description: '',
    });

    const [transferData, setTransferData] = useState({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: '',
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await accountService.getAll();
            setAccounts(data.accounts || []);
            setTotalBalance(data.totalBalance || 0);
        } catch (err) {
            setError('Failed to load accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAccount) {
                await accountService.update(editingAccount._id, formData);
            } else {
                await accountService.create(formData);
            }
            setShowModal(false);
            resetForm();
            fetchAccounts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save account');
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            await accountService.transfer(
                transferData.fromAccountId,
                transferData.toAccountId,
                parseFloat(transferData.amount),
                transferData.description
            );
            setShowTransferModal(false);
            setTransferData({ fromAccountId: '', toAccountId: '', amount: '', description: '' });
            fetchAccounts();
        } catch (err) {
            setError(err.response?.data?.message || 'Transfer failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this account?')) {
            try {
                await accountService.delete(id);
                fetchAccounts();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete account');
            }
        }
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setFormData({
            name: account.name,
            type: account.type,
            balance: account.balance,
            color: account.color || '#2F6F6D',
            description: account.description || '',
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'cash',
            balance: '',
            color: '#2F6F6D',
            description: '',
        });
        setEditingAccount(null);
    };

    const getAccountIcon = (type) => {
        switch (type) {
            case 'cash': return Wallet;
            case 'bank': return Building2;
            case 'credit_card': return CreditCard;
            case 'investment': return TrendingUp;
            case 'loan': return ArrowDownCircle;
            default: return Wallet;
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading accounts...</p>
            </div>
        );
    }

    return (
        <div className="accounts-page">
            <div className="page-header">
                <div>
                    <h1>Accounts</h1>
                    <p className="text-muted">Manage your financial accounts</p>
                </div>
                <div className="header-actions">
                    {accounts.length >= 2 && (
                        <button className="btn btn-secondary" onClick={() => setShowTransferModal(true)}>
                            <ArrowRightLeft size={20} />
                            Transfer
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        <Plus size={20} />
                        Add Account
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Total Balance */}
            <div className="total-balance-card">
                <p className="total-label">Total Balance</p>
                <h2 className="total-value">{formatCurrency(totalBalance)}</h2>
            </div>

            {/* Accounts Grid */}
            <div className="accounts-grid">
                {accounts.length > 0 ? (
                    accounts.map((account) => {
                        const IconComponent = getAccountIcon(account.type);
                        return (
                            <div key={account._id} className="account-card">
                                <div className="account-card-header">
                                    <div
                                        className="account-icon"
                                        style={{ backgroundColor: account.color || '#2F6F6D' }}
                                    >
                                        <IconComponent size={24} color="white" />
                                    </div>
                                    <div className="account-actions">
                                        <button className="btn-icon" onClick={() => handleEdit(account)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon danger" onClick={() => handleDelete(account._id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="account-name">{account.name}</h3>
                                <p className="account-type">{account.type.replace('_', ' ')}</p>
                                <p className="account-balance" style={{ color: account.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                    {formatCurrency(account.balance)}
                                </p>
                                {account.description && (
                                    <p className="account-description">{account.description}</p>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <Wallet size={48} />
                        <p>No accounts yet</p>
                        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                            Add your first account
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAccount ? 'Edit Account' : 'Add Account'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Account Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Main Wallet, Savings Bank"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Account Type</label>
                        <select
                            className="form-select"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            {ACCOUNT_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Initial Balance</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.balance}
                            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                            placeholder="Enter current balance"
                            required
                            step="0.01"
                        />
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
                        <label className="form-label">Description (Optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingAccount ? 'Update' : 'Add'} Account
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Transfer Modal */}
            <Modal
                isOpen={showTransferModal}
                onClose={() => setShowTransferModal(false)}
                title="Transfer Between Accounts"
            >
                <form onSubmit={handleTransfer}>
                    <div className="form-group">
                        <label className="form-label">From Account</label>
                        <select
                            className="form-select"
                            value={transferData.fromAccountId}
                            onChange={(e) => setTransferData({ ...transferData, fromAccountId: e.target.value })}
                            required
                        >
                            <option value="">Select source account</option>
                            {accounts.filter(a => a._id !== transferData.toAccountId).map((acc) => (
                                <option key={acc._id} value={acc._id}>
                                    {acc.name} ({formatCurrency(acc.balance)})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">To Account</label>
                        <select
                            className="form-select"
                            value={transferData.toAccountId}
                            onChange={(e) => setTransferData({ ...transferData, toAccountId: e.target.value })}
                            required
                        >
                            <option value="">Select destination account</option>
                            {accounts.filter(a => a._id !== transferData.fromAccountId).map((acc) => (
                                <option key={acc._id} value={acc._id}>
                                    {acc.name} ({formatCurrency(acc.balance)})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount</label>
                        <input
                            type="number"
                            className="form-input"
                            value={transferData.amount}
                            onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                            placeholder="Enter amount to transfer"
                            required
                            min="1"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Note (Optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={transferData.description}
                            onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                            placeholder="Add a note"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Transfer
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Accounts;
