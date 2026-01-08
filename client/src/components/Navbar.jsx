import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-left">
                    <button className="hamburger-btn" onClick={onMenuClick}>
                        <Menu size={24} />
                    </button>
                    <h2 className="navbar-title">Welcome back, {user?.name}!</h2>
                </div>

                <div className="navbar-right">
                    <Link to="/profile" className="navbar-profile">
                        <User size={20} />
                        <span>{user?.name}</span>
                    </Link>

                    <button onClick={logout} className="btn btn-secondary btn-sm">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
