import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { BellIcon, UserIcon, MenuIcon, CloseIcon } from './Icons';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Seeker notifications state and refs
    const [notifications, setNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const notifRef = useRef(null);
    const notifButtonRef = useRef(null);

    // Mobile Menu State
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    // Polling interval & fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user || (user.role !== 'seeker' && user.role !== 'jobseeker')) return;
            try {
                const res = await API.get('/jobs/notifications');
                setNotifications(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            }
        };

        fetchNotifications();
        if (user && (user.role === 'seeker' || user.role === 'jobseeker')) {
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Close notifications dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showNotifDropdown &&
                notifRef.current &&
                !notifRef.current.contains(event.target) &&
                notifButtonRef.current &&
                !notifButtonRef.current.contains(event.target)
            ) {
                setShowNotifDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifDropdown]);

    const handleViewNotification = async (id) => {
        try {
            await API.delete(`/jobs/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await API.delete(`/jobs/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    // Determine the active tab to dynamically style the buttons
    const queryParams = new URLSearchParams(location.search);
    const activeTab = queryParams.get('tab') || 'feed';
    const isDashboard = location.pathname === '/dashboard';
    const isFeedActive = isDashboard && activeTab === 'feed';
    const isAppsActive = isDashboard && activeTab === 'applications';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitial = (name) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', flexShrink: 0 }}>
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Smart Job Portal
            </Link>
            
            <button 
                className="mobile-menu-toggle" 
                aria-label="Toggle navigation menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
            </button>

            <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                {(!user || (user.role !== 'employer' && user.role !== 'superadmin')) && (
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
                )}
                
                {(user && (user.role === 'seeker' || user.role === 'jobseeker')) && (
                    <>
                        <Link 
                            to="/dashboard?tab=feed" 
                            className={`nav-link ${isFeedActive ? 'active' : ''}`}
                        >
                            Find My Job
                        </Link>
                        <Link 
                            to="/dashboard?tab=applications" 
                            className={`nav-link ${isAppsActive ? 'active' : ''}`}
                        >
                            My Application
                        </Link>
                    </>
                )}
                
                {user ? (
                    <>
                        {user.role === 'employer' && (
                            <Link 
                                to="/employer-dashboard" 
                                className={`nav-link ${location.pathname === '/employer-dashboard' ? 'active' : ''}`}
                            >
                                Dashboard
                            </Link>
                        )}
                        {user.role === 'superadmin' && (
                            <Link 
                                to="/superadmin" 
                                className={`nav-link ${location.pathname === '/superadmin' ? 'active' : ''}`}
                            >
                                Admin Panel
                            </Link>
                        )}
                        {(user.role === 'seeker' || user.role === 'jobseeker') && (
                            <div className="notification-container" style={{ position: 'relative' }} ref={notifRef}>
                                <button 
                                    ref={notifButtonRef}
                                    className="notification-btn"
                                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                    aria-label="Toggle notifications dropdown"
                                >
                                    <BellIcon size={20} />
                                    {notifications.length > 0 && (
                                        <span className="notification-badge"></span>
                                    )}
                                </button>
                                {showNotifDropdown && (
                                    <div className="notif-dropdown">
                                        <div className="notif-header">
                                            <h4>Notifications</h4>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '600' }}>
                                                ({notifications.length})
                                            </span>
                                        </div>
                                        <div className="notif-list">
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                                    No new notifications
                                                </div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div 
                                                        key={notif._id} 
                                                        onClick={() => handleViewNotification(notif._id)}
                                                        className="notif-item"
                                                    >
                                                        <span className="notif-text">{notif.message}</span>
                                                        <span 
                                                            className="notif-close" 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif._id); }}
                                                        >
                                                            ✖
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {user.role !== 'superadmin' && (
                            <Link 
                                to="/my-account" 
                                className={`nav-link ${location.pathname === '/my-account' ? 'active' : ''}`} 
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                            >
                                <div className="user-avatar-btn">
                                    <span className="user-avatar">{getInitial(user.name)}</span>
                                    <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.name}
                                    </span>
                                </div>
                            </Link>
                        )}
                        <button 
                            onClick={handleLogout} 
                            className="btn-outline" 
                            style={{ padding: '8px 18px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Login</Link>
                        <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;