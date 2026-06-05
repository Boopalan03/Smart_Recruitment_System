import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

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
                        {user.role === 'seeker' ? (
                            <>
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                <Link to="/my-account" className="nav-link" style={{display:'flex', alignItems:'center', gap:'5px', fontWeight:'600'}}>
                                    👤 My Account
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="" className="nav-link">Employer Panel</Link>
                                {/* ✅ EMPLOYER ONLY: Direct Logout Button */}
                                <button 
                                    onClick={handleLogout} 
                                    className="btn-outline" 
                                    style={{padding: '6px 16px', color: '#ef4444', borderColor: '#ef4444'}}
                                >
                                    Logout
                                </button>
                            </>
                        )}
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