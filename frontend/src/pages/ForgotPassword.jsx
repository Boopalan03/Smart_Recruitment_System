import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/reset-password', { email, newPassword });
            alert(res.data.msg);
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.msg || 'Reset Failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">Enter your email and define your new password below</p>

                <form onSubmit={handleResetPassword} className="auth-form">
                    <div className="auth-form-group">
                        <label className="auth-label">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@example.com" 
                            className="auth-input"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="auth-form-group">
                        <label className="auth-label">New Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter new password" 
                            className="auth-input"
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <button type="submit" className="auth-btn">Reset Password</button>
                </form>

                <div className="auth-footer">
                    Remember your password? 
                    <Link to="/login" className="auth-link">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;