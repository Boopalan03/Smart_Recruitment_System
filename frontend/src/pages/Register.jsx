import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import API from '../api';

const Register = () => {
    const [searchParams] = useSearchParams();
    const defaultRole = searchParams.get('role') === 'employer' ? 'employer' : 'seeker';
    const [role, setRole] = useState(defaultRole);

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
            const msg = err.response?.data?.msg || `Failed to send OTP (${err.message})`;
            alert(msg);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const registeredUser = await register({ ...formData, role });
            alert("Registration Successful!");
            if (registeredUser && registeredUser.role === 'employer') {
                navigate('/employer-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            const msg = err.response?.data?.msg || 'Registration Failed';
            alert(msg);
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">{role === 'employer' ? 'Employer Registration' : 'Seeker Registration'}</h2>
            
            <div className="auth-tabs" style={{ display: 'flex', width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <button 
                    type="button"
                    onClick={() => { if (!otpSent) setRole('seeker'); }}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: 'none',
                        background: role === 'seeker' ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)' : 'white',
                        color: role === 'seeker' ? 'white' : '#475569',
                        fontWeight: '600',
                        cursor: otpSent ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s'
                    }}
                    disabled={otpSent}
                >
                    Job Seeker
                </button>
                <button 
                    type="button"
                    onClick={() => { if (!otpSent) setRole('employer'); }}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: 'none',
                        background: role === 'employer' ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)' : 'white',
                        color: role === 'employer' ? 'white' : '#475569',
                        fontWeight: '600',
                        cursor: otpSent ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s'
                    }}
                    disabled={otpSent}
                >
                    Employer
                </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <input 
                    type="text" placeholder={role === 'employer' ? "Company Name" : "Full Name"} className="auth-input"
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