import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, PieChart, BarChart3, Tag, Target, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
        { to: '/accounts', icon: Wallet, label: 'Accounts' },
        { to: '/budgets', icon: PieChart, label: 'Budgets' },
        { to: '/goals', icon: Target, label: 'Goals' },
        { to: '/categories', icon: Tag, label: 'Categories' },
        { to: '/reports', icon: BarChart3, label: 'Reports' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px' }} />
                        <h1 className="sidebar-logo" style={{ marginBottom: 0 }}>DhanRaksha</h1>
                    </div>
                    <p className="sidebar-tagline" style={{ paddingLeft: '3.25rem' }}>Financial Dashboard</p>
                    <button className="sidebar-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
