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
                navigate('/employer-dashboard');
            } else {
                navigate('/');
            }
        } catch {
            alert('Invalid Credentials');
        }
    };


    return (
        <div className="auth-container">
            <h2 className="auth-title">Login</h2>
            
            <form onSubmit={handleSubmit} className="auth-form">
                <div>
                    <label style={{display: 'block', marginBottom: '5px', fontSize:'0.9rem', fontWeight:'500'}}>Email Address</label>
                    <input 
                        type="email" placeholder="Enter your email" className="auth-input"
                        onChange={(e) => setFormData({...formData, email: e.target.value})} required 
                    />
                </div>
                
                <div>
                    <label style={{display: 'block', marginBottom: '5px', fontSize:'0.9rem', fontWeight:'500'}}>Password</label>
                    <input 
                        type="password" placeholder="Enter your password" className="auth-input"
                        onChange={(e) => setFormData({...formData, password: e.target.value})} required 
                    />
                </div>

                <div style={{textAlign: 'right', marginBottom: '5px'}}>
                    <Link to="/forgot-password" style={{color: '#64748b', fontSize: '0.85rem', textDecoration: 'none'}}>
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
    );
};

export default Login;