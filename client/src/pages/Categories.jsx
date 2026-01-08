import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { COLORS } from '../utils/constants';
import './Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('expense');

    const [formData, setFormData] = useState({
        name: '',
        type: 'expense',
        color: '#3B82F6',
        icon: 'shopping-cart',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAll();
            setCategories(data || []);
        } catch (err) {
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory._id, formData);
            } else {
                await categoryService.create(formData);
            }
            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoryService.delete(id);
                fetchCategories();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            type: category.type,
            color: category.color || '#3B82F6',
            icon: category.icon || 'shopping-cart',
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: activeTab,
            color: '#3B82F6',
            icon: 'shopping-cart',
        });
        setEditingCategory(null);
    };

    const openAddModal = () => {
        resetForm();
        setFormData(prev => ({ ...prev, type: activeTab }));
        setShowModal(true);
    };

    const filteredCategories = categories.filter(c => c.type === activeTab);

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading categories...</p>
            </div>
        );
    }

    return (
        <div className="categories-page">
            <div className="page-header">
                <div>
                    <h1>Categories</h1>
                    <p className="text-muted">Organize your transactions</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Type Tabs */}
            <div className="category-tabs">
                <button
                    className={`category-tab ${activeTab === 'expense' ? 'active expense' : ''}`}
                    onClick={() => setActiveTab('expense')}
                >
                    Expense Categories
                </button>
                <button
                    className={`category-tab ${activeTab === 'income' ? 'active income' : ''}`}
                    onClick={() => setActiveTab('income')}
                >
                    Income Categories
                </button>
            </div>

            {/* Categories Grid */}
            <div className="categories-grid">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                        <div key={category._id} className="category-card">
                            <div
                                className="category-icon"
                                style={{ backgroundColor: category.color || '#6B7280' }}
                            >
                                {category.name.charAt(0)}
                            </div>
                            <div className="category-info">
                                <h3 className="category-name">{category.name}</h3>
                                <p className="category-type">{category.type}</p>
                            </div>
                            <div className="category-actions">
                                <button className="btn-icon" onClick={() => handleEdit(category)}>
                                    <Edit2 size={16} />
                                </button>
                                {!category.isDefault && (
                                    <button className="btn-icon danger" onClick={() => handleDelete(category._id)}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No {activeTab} categories yet</p>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            Add your first category
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Category Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Food, Transportation, Salary"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <div className="type-selector">
                            <button
                                type="button"
                                className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'expense' })}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'income' })}
                            >
                                Income
                            </button>
                        </div>
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

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingCategory ? 'Update' : 'Add'} Category
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;
