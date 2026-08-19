import { useState } from 'react';
import API from '../api';

const AdminCreateEmployer = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/create-employer', formData);
            alert('✅ Employer Created Successfully!');
            setFormData({ name: '', email: '', password: '' }); // Reset form
        } catch (err) {
            const errorMessage = err.response?.data?.msg || 'Error creating employer';
            alert(`❌ Failed: ${errorMessage}`);
            console.error(err);
        }
    };

    return (
        <div className="auth-wrapper" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="auth-container" style={{ border: '2px solid var(--primary)' }}>
                <h2 className="auth-title" style={{ color: 'var(--primary)' }}>Admin: Add Employer</h2>
                <p className="auth-subtitle">Manually provision and authorize a verified company account</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form-group">
                        <label className="auth-label">Company Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Acme Corporation" 
                            className="auth-input"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <div className="auth-form-group">
                        <label className="auth-label">Company Email</label>
                        <input 
                            type="email" 
                            placeholder="hr@company.com" 
                            className="auth-input"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Set Password</label>
                        <input 
                            type="password" 
                            placeholder="Minimum 6 characters" 
                            className="auth-input"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            required 
                        />
                    </div>

                    <button type="submit" className="auth-btn" style={{ background: 'var(--primary-dark)' }}>
                        Create Employer Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminCreateEmployer;