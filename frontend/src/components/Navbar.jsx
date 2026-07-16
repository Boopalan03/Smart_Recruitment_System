import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

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
                <Link to="/" className="nav-link">Home</Link>
                
                {user ? (
                    <>
                        {user.role === 'employer' && (
                            <Link to="/employer-dashboard" className="nav-link">
                                Dashboard
                            </Link>
                        )}
                        {user.role === 'seeker' && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginRight: '10px' }}>
                                <Link 
                                    to="/dashboard?tab=feed" 
                                    className={isFeedActive ? "btn-primary" : "btn-outline"}
                                    style={{ padding: '6px 16px', textDecoration: 'none', display: 'inline-block', lineHeight: '1.5' }}
                                >
                                    Find Jobs
                                </Link>
                                <Link 
                                    to="/dashboard?tab=applications" 
                                    className={isAppsActive ? "btn-primary" : "btn-outline"}
                                    style={{ padding: '6px 16px', textDecoration: 'none', display: 'inline-block', lineHeight: '1.5' }}
                                >
                                    My Applications
                                </Link>
                            </div>
                        )}
                        <Link to="/my-account" className="nav-link" style={{display:'flex', alignItems:'center', gap:'5px', fontWeight:'600'}}>
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
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn-primary">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;