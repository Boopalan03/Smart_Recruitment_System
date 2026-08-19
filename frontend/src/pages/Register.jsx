import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const Register = () => {
    const [searchParams] = useSearchParams();
    const defaultRole = searchParams.get('role') === 'employer' ? 'employer' : 'seeker';
    const [role, setRole] = useState(defaultRole);

    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        contact: '',
        gender: '',
        dob: '',
        password: '' 
    });
    
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

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
        <div className="auth-wrapper">
            <div className="auth-container" style={{ maxWidth: '540px' }}>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join us to explore or publish open career opportunities</p>
                
                <div className="auth-tabs">
                    <button 
                        type="button"
                        className={`auth-tab-btn ${role === 'seeker' ? 'active' : ''}`}
                        onClick={() => setRole('seeker')}
                    >
                        🎓 Job Seeker
                    </button>
                    <button 
                        type="button"
                        className={`auth-tab-btn ${role === 'employer' ? 'active' : ''}`}
                        onClick={() => setRole('employer')}
                    >
                        💼 Employer
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form-group">
                        <label className="auth-label">
                            {role === 'employer' ? 'Company Name' : 'Full Name'} <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder={role === 'employer' ? "e.g. Acme Corporation" : "e.g. John Doe"} 
                            className="auth-input"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input 
                            type="email" 
                            placeholder="name@example.com" 
                            className="auth-input"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Phone Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input 
                            type="tel" 
                            placeholder="e.g. +91 9876543210" 
                            className="auth-input"
                            value={formData.contact}
                            onChange={(e) => setFormData({...formData, contact: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="auth-form-group">
                            <label className="auth-label">Gender <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <select 
                                className="auth-input"
                                value={formData.gender}
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                required
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">Date of Birth <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input 
                                type="date" 
                                className="auth-input"
                                value={formData.dob}
                                onChange={(e) => setFormData({...formData, dob: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Set Password <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input 
                            type="password" 
                            placeholder="Min 6 characters" 
                            className="auth-input"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="auth-btn">Register</button>
                </form>

                <div className="auth-footer">
                    Already have an account? 
                    <Link to="/login" className="auth-link">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;