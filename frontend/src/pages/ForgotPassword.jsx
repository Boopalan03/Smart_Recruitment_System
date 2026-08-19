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
        <div className="auth-container">
            <h2 className="auth-title">Reset Password</h2>

            <form onSubmit={handleResetPassword} className="auth-form">
                <p style={{textAlign:'center', color:'#64748b', fontSize:'0.9rem'}}>
                    Enter your account email and your new password.
                </p>
                <input 
                    type="email" placeholder="Enter your email" className="auth-input"
                    value={email} onChange={(e) => setEmail(e.target.value)} required 
                />
                <input 
                    type="password" placeholder="Enter New Password" className="auth-input"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                />
                <button type="submit" className="auth-btn">Reset Password</button>
            </form>

            <div className="auth-footer">
                Remember your password? 
                <Link to="/login" className="auth-link">Login</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;