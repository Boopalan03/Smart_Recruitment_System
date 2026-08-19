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
        <div className="auth-container">
            <h2 className="auth-title">{role === 'employer' ? 'Employer Registration' : 'Seeker Registration'}</h2>
            
            <div className="auth-tabs" style={{ display: 'flex', width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <button 
                    type="button"
                    onClick={() => setRole('seeker')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: 'none',
                        background: role === 'seeker' ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)' : 'white',
                        color: role === 'seeker' ? 'white' : '#475569',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Job Seeker
                </button>
                <button 
                    type="button"
                    onClick={() => setRole('employer')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: 'none',
                        background: role === 'employer' ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)' : 'white',
                        color: role === 'employer' ? 'white' : '#475569',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Employer
                </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <input 
                    type="text" placeholder={role === 'employer' ? "Company Name" : "Full Name"} className="auth-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                />
                <input 
                    type="email" placeholder="Email Address" className="auth-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    required 
                />
                <input 
                    type="password" placeholder="Set Password" className="auth-input"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required 
                />
                
                <button type="submit" className="auth-btn">Register</button>
            </form>

             <div className="auth-footer">
                Already have an account? 
                <Link to="/login" className="auth-link">Login</Link>
            </div>

        </div>
    );
};

export default Register;