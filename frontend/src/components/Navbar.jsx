import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Seeker notifications state and refs
    const [notifications, setNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const notifRef = useRef(null);
    const notifButtonRef = useRef(null);

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

    return (
        <nav className="navbar">
            <Link to="/" className="logo">Smart Job Portal</Link>
            
            <div className="nav-links">
                {(!user || user.role !== 'employer') && (
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
                        {(user.role === 'seeker' || user.role === 'jobseeker') && (
                            <div className="notification-container" style={{ position: 'relative' }} ref={notifRef}>
                                <button 
                                    ref={notifButtonRef}
                                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                    style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', padding: '6px', color: '#475569' }}
                                >
                                    🔔
                                    {notifications.length > 0 && (
                                        <span style={{ position: 'absolute', top: '0', right: '0', background: '#ef4444', width: '8px', height: '8px', borderRadius: '50%' }}></span>
                                    )}
                                </button>
                                {showNotifDropdown && (
                                    <div className="sidebar" style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        zIndex: 999,
                                        width: '320px',
                                        background: 'white',
                                        boxShadow: '0 15px 30px rgba(15, 23, 42, 0.15), 0 5px 15px rgba(15, 23, 42, 0.1)',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        textAlign: 'left',
                                        marginTop: '10px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '10px' }}>
                                            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>Notifications</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({notifications.length})</span>
                                        </div>
                                        <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                    No new notifications
                                                </div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div 
                                                        key={notif._id} 
                                                        onClick={() => handleViewNotification(notif._id)}
                                                        style={{ 
                                                            padding: '10px 12px', 
                                                            background: '#f8fafc', 
                                                            border: '1px solid #e2e8f0', 
                                                            borderRadius: '8px', 
                                                            fontSize: '0.85rem', 
                                                            color: '#334155', 
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f1f5f9'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                                                    >
                                                        <span style={{ flex: 1, marginRight: '10px', lineHeight: '1.4' }}>{notif.message}</span>
                                                        <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', padding: '2px 6px' }} onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif._id); }}>✖</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <Link 
                            to="/my-account" 
                            className={`nav-link ${location.pathname === '/my-account' ? 'active' : ''}`} 
                            style={{display:'flex', alignItems:'center', gap:'5px', fontWeight:'600'}}
                        >
                            👤 {user.name}
                        </Link>
                        <button 
                            onClick={handleLogout} 
                            className="btn-outline" 
                            style={{padding: '6px 16px', color: '#ef4444', borderColor: '#ef4444'}}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Login</Link>
                        <Link to="/register" className="btn-primary">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;