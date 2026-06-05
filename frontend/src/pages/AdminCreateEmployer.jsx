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
            // ✅ IMPROVED ERROR HANDLING
            // This will show the actual error message from the backend
            const errorMessage = err.response?.data?.msg || 'Error creating employer';
            alert(`❌ Failed: ${errorMessage}`);
            console.error(err);
        }
    };

    return (
        <div className="auth-container" style={{ border: '2px solid #2563eb', marginTop: '50px' }}>
            <h2 className="auth-title" style={{ color: '#2563eb' }}>Admin: Create Employer</h2>
            <p style={{textAlign:'center', marginBottom:'15px', color:'#666'}}>
                Use this form to manually add verified companies.
            </p>
            
            <form onSubmit={handleSubmit} className="auth-form">
                <input 
                    type="text" placeholder="Company Name" className="auth-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})} required 
                />
                <input 
                    type="email" placeholder="Company Email" className="auth-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} required 
                />
                <input 
                    type="password" placeholder="Set Password" className="auth-input"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})} required 
                />

                <button type="submit" className="auth-btn" style={{backgroundColor: '#1e293b'}}>
                    Create Employer Account
                </button>
            </form>
        </div>
    );
};

export default AdminCreateEmployer;