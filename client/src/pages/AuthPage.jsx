import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, Shield, TrendingUp, PiggyBank } from 'lucide-react';
import './AuthPage.css';

const AuthPage = () => {
    const location = useLocation();
    const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Login form data
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    // Register form data
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegisterChange = (e) => {
        setRegisterData({
            ...registerData,
            [e.target.name]: e.target.value,
        });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(loginData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (registerData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...data } = registerData;
            await register(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const togglePanel = () => {
        setIsSignUp(!isSignUp);
        setError('');
    };

    return (
        <div className="auth-page">
            <div className={`auth-wrapper ${isSignUp ? 'sign-up-mode' : ''}`}>
                {/* Forms Container */}
                <div className="forms-container">
                    {/* Sign In Form */}
                    <div className="signin-signup">
                        <form onSubmit={handleLoginSubmit} className={`sign-in-form ${isSignUp ? 'hidden' : ''}`}>
                            <div className="auth-brand">
                                <div className="brand-icon">
                                    <Shield size={24} />
                                </div>
                                <span className="brand-name">DhanRaksha</span>
                            </div>

                            <h2 className="form-title">Welcome Back</h2>
                            <p className="form-subtitle">Access your personal dashboard and insights.</p>

                            {error && !isSignUp && (
                                <div className="auth-alert">
                                    {error}
                                </div>
                            )}

                            <div className="input-field">
                                <label className="input-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={loginData.email}
                                        onChange={handleLoginChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-field">
                                <div className="label-row">
                                    <label className="input-label">Password</label>
                                    <a href="#" className="forgot-link">Forgot?</a>
                                </div>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="remember-row">
                                <label className="checkbox-label">
                                    <input type="checkbox" />
                                    <span className="checkmark"></span>
                                    Keep me logged in
                                </label>
                            </div>

                            <button type="submit" className="auth-btn primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                    </>
                                )}
                            </button>

                            <div className="security-badge">
                                <Shield size={14} />
                                <span>Institutional Grade Security</span>
                            </div>
                        </form>

                        {/* Sign Up Form */}
                        <form onSubmit={handleRegisterSubmit} className={`sign-up-form ${!isSignUp ? 'hidden' : ''}`}>
                            <div className="auth-brand">
                                <div className="brand-icon">
                                    <Shield size={24} />
                                </div>
                                <span className="brand-name">DhanRaksha</span>
                            </div>

                            <h2 className="form-title">Create Account</h2>
                            <p className="form-subtitle">Start managing your finances today.</p>

                            {error && isSignUp && (
                                <div className="auth-alert">
                                    {error}
                                </div>
                            )}

                            <div className="input-field">
                                <label className="input-label">Full Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        value={registerData.name}
                                        onChange={handleRegisterChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-field">
                                <label className="input-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={registerData.email}
                                        onChange={handleRegisterChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-field">
                                <label className="input-label">Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••"
                                        value={registerData.password}
                                        onChange={handleRegisterChange}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-field">
                                <label className="input-label">Confirm Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={registerData.confirmPassword}
                                        onChange={handleRegisterChange}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="auth-btn primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={20} />
                                        Create Account
                                    </>
                                )}
                            </button>

                            <div className="security-badge">
                                <Shield size={14} />
                                <span>256-bit Encryption</span>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sliding Panel */}
                <div className="panels-container">
                    <div className={`panel left-panel ${isSignUp ? 'hidden-panel' : ''}`}>
                        <div className="content">
                            <div className="panel-icon">
                                <TrendingUp size={48} />
                            </div>
                            <h3>New Here?</h3>
                            <p>Join thousands of users who have transformed their financial habits with our intuitive tracking tools.</p>
                            <button className="panel-btn" onClick={togglePanel}>
                                Join Now
                            </button>
                        </div>
                        <div className="floating-icons">
                            <div className="floating-icon icon-1">
                                <TrendingUp size={32} />
                            </div>
                            <div className="floating-icon icon-2">
                                <PiggyBank size={40} />
                            </div>
                            <div className="floating-icon icon-3">
                                <Shield size={28} />
                            </div>
                        </div>
                    </div>

                    <div className={`panel right-panel ${!isSignUp ? 'hidden-panel' : ''}`}>
                        <div className="content">
                            <div className="panel-icon">
                                <Shield size={48} />
                            </div>
                            <h3>Already a Member?</h3>
                            <p>Sign in to access your dashboard and continue tracking your financial journey.</p>
                            <button className="panel-btn" onClick={togglePanel}>
                                Sign In
                            </button>
                        </div>
                        <div className="floating-icons">
                            <div className="floating-icon icon-1">
                                <TrendingUp size={32} />
                            </div>
                            <div className="floating-icon icon-2">
                                <PiggyBank size={40} />
                            </div>
                            <div className="floating-icon icon-3">
                                <Shield size={28} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Security Badges */}
            <div className="auth-footer-badges">
                <div className="badge-item">
                    <Shield size={16} />
                    <span>AES-256 Encrypted</span>
                </div>
                <div className="badge-item">
                    <Lock size={16} />
                    <span>Bank-Level Security</span>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
