import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/forgot-password', { email });
            alert(res.data.msg);
            setStep(2);
        } catch (err) {
            alert(err.response?.data?.msg || 'Error sending OTP');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/reset-password', { email, otp, newPassword });
            alert(res.data.msg);
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.msg || 'Reset Failed');
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Reset Password</h2>

            {step === 1 && (
                <form onSubmit={handleSendOtp} className="auth-form">
                    <p style={{textAlign:'center', color:'#64748b', fontSize:'0.9rem'}}>
                        Enter your email to receive a verification OTP.
                    </p>
                    <input 
                        type="email" placeholder="Enter your email" className="auth-input"
                        value={email} onChange={(e) => setEmail(e.target.value)} required 
                    />
                    <button type="submit" className="auth-btn">Send OTP</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleResetPassword} className="auth-form">
                    <div style={{textAlign:'center', marginBottom:'10px', fontSize:'0.9rem', color:'#2563eb'}}>
                        OTP Sent to {email}
                    </div>
                    <input 
                        type="text" placeholder="Enter 6-digit OTP" className="auth-input"
                        maxLength="6"
                        value={otp} onChange={(e) => setOtp(e.target.value)} required 
                    />
                    <input 
                        type="password" placeholder="Enter New Password" className="auth-input"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                    />
                    <button type="submit" className="auth-btn">Reset Password</button>
                </form>
            )}

            <div className="auth-footer">
                Remember your password? 
                <Link to="/login" className="auth-link">Login</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;