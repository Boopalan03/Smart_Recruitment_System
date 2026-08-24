import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loggedInUser = await login(formData.email, formData.password);
            if (loggedInUser && loggedInUser.role === 'employer') {
                navigate('/employer-dashboard', { replace: true });
            } else if (loggedInUser && loggedInUser.role === 'superadmin') {
                navigate('/superadmin', { replace: true });
            } else {
                navigate('/dashboard?tab=feed', { replace: true }); // Redirect seeker to dashboard feed
            }
        } catch {
            alert('Invalid Credentials');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Login to access your recruitment dashboard</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form-group">
                        <label className="auth-label">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@company.com" 
                            className="auth-input"
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <div className="auth-form-group">
                        <label className="auth-label">Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter your password" 
                            className="auth-input"
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            required 
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                        <Link to="/forgot-password" style={{ color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="auth-btn">Login</button>
                </form>

                <div className="auth-separator">OR</div>

                <div className="auth-footer">
                    Don't have an account? 
                    <Link to="/register" className="auth-link">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;