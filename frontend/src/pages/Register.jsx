import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '',
        otp: '' 
    });
    
    const [otpSent, setOtpSent] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.password) {
            alert("Please fill in Name, Email, and Password first.");
            return;
        }

        try {
            const res = await API.post('/auth/send-otp', { email: formData.email });
            alert(res.data.msg);
            setOtpSent(true);
        } catch (err) {
            const msg = err.response?.data?.msg || 'Error sending OTP';
            alert(msg);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            alert("Registration Successful!");
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.msg || 'Registration Failed';
            alert(msg);
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Seeker Registration</h2>
            
            <form onSubmit={handleSubmit} className="auth-form">
                <input 
                    type="text" placeholder="Full Name" className="auth-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    disabled={otpSent}
                    required 
                />
                <input 
                    type="email" placeholder="Email Address" className="auth-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    disabled={otpSent}
                    required 
                />
                <input 
                    type="password" placeholder="Set Password" className="auth-input"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    disabled={otpSent}
                    required 
                />
                
                {otpSent ? (
                    <>
                        <div style={{textAlign:'center', fontSize:'0.9rem', color:'#2563eb', margin:'10px 0'}}>
                            OTP sent to {formData.email}
                        </div>
                        <input 
                            type="text" placeholder="Enter 6-digit OTP" className="auth-input"
                            maxLength="6"
                            value={formData.otp}
                            onChange={(e) => setFormData({...formData, otp: e.target.value})} 
                            required 
                        />
                        <button type="submit" className="auth-btn">Verify & Register</button>
                        
                        <button 
                            type="button" 
                            onClick={() => setOtpSent(false)}
                            style={{marginTop:'10px', background:'none', border:'none', color:'#64748b', cursor:'pointer', textDecoration:'underline', width:'100%'}}
                        >
                            Change Email / Resend
                        </button>
                    </>
                ) : (
                    <button 
                        type="button" 
                        onClick={handleSendOtp} 
                        className="auth-btn" 
                        style={{backgroundColor: '#1e293b'}}
                    >
                        Send OTP
                    </button>
                )}
            </form>

             <div className="auth-footer">
                Already have an account? 
                <Link to="/login" className="auth-link">Login</Link>
            </div>

        </div>
    );
};

export default Register;