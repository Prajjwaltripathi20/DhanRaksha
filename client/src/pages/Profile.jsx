import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, Lock } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        currency: user?.currency || 'INR',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await updateUser(formData);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setMessage('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMessage('Password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);

        try {
            await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
            setPasswordMessage('Password updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordMessage(err.response?.data?.message || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div>
            <div className="dashboard-header">
                <h1>Profile</h1>
                <p className="text-muted">Manage your account settings</p>
            </div>

            <div className="grid grid-2">
                {/* Profile Information */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <User size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Profile Information
                        </h3>
                    </div>

                    {message && (
                        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                value={user?.email || ''}
                                disabled
                            />
                            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Email cannot be changed</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="currency" className="form-label">Currency</label>
                            <select
                                id="currency"
                                name="currency"
                                className="form-select"
                                value={formData.currency}
                                onChange={handleChange}
                            >
                                <option value="INR">INR - Indian Rupee</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Lock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Change Password
                        </h3>
                    </div>

                    {passwordMessage && (
                        <div className={`alert ${passwordMessage.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                            {passwordMessage}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentPassword" className="form-label">Current Password</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                className="form-input"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                className="form-input"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-input"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                            {passwordLoading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Account Details */}
            <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="card-header">
                    <h3 className="card-title">Account Details</h3>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', flexWrap: 'wrap' }}>
                    <div>
                        <p className="text-muted" style={{ marginBottom: 'var(--spacing-xs)' }}>User ID</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{user?._id}</p>
                    </div>

                    <div>
                        <p className="text-muted" style={{ marginBottom: 'var(--spacing-xs)' }}>Account Created</p>
                        <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
