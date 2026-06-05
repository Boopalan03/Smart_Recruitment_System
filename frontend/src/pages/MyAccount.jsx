import { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import CustomModal from '../components/CustomModal';

const MyAccount = () => {
    const { user, logout } = useContext(AuthContext); // Get user role from context
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, type: 'info', message: '' });
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        gender: '',
        dob: ''
    });

    // 1. Fetch User Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get('/auth/me');
                const data = res.data;
                
                let formattedDob = '';
                if (data.dob) {
                    formattedDob = new Date(data.dob).toISOString().split('T')[0];
                }

                setFormData({
                    name: data.name || '',
                    email: data.email || '', 
                    contact: data.contact || '',
                    gender: data.gender || '',
                    dob: formattedDob
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // 2. Handle Update
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await API.put('/auth/update-profile', formData);
            setModal({ isOpen: true, type: 'success', message: '✅ Profile Updated Successfully!' });
        } catch {
            setModal({ isOpen: true, type: 'error', message: '❌ Failed to update profile.' });
        }
    };

    if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading Profile...</div>;

    return (
        <div className="container">
            <div className="auth-container" style={{maxWidth: '600px'}}>
                <h2 className="auth-title">
                    {user?.role === 'employer' ? 'Company Profile' : 'My Account'}
                </h2>
                
                <form onSubmit={handleUpdate} className="auth-form">
                    
                    {/* Name / Company Name */}
                    <div>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>
                            {user?.role === 'employer' ? 'Company Name' : 'Full Name'}
                        </label>
                        <input 
                            type="text" className="auth-input"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {/* Email (Read Only) */}
                    <div>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Email (Cannot Change)</label>
                        <input 
                            type="email" className="auth-input"
                            value={formData.email}
                            disabled
                            style={{backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed'}}
                        />
                    </div>

                    {/* Contact Number */}
                    <div>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Contact Number</label>
                        <input 
                            type="text" className="auth-input"
                            placeholder="+91 9876543210"
                            value={formData.contact}
                            onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        />
                    </div>

                    {/* ✅ ONLY SHOW GENDER & DOB FOR SEEKERS */}
                    {user?.role === 'seeker' && (
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                            <div>
                                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Gender</label>
                                <select 
                                    className="auth-input"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Date of Birth</label>
                                <input 
                                    type="date" className="auth-input"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="auth-btn" style={{marginTop:'20px'}}>
                        Save Changes
                    </button>

                </form>

                <hr style={{margin: '30px 0', border: '0', borderTop: '1px solid #e2e8f0'}} />
                
                <button 
                    onClick={logout} 
                    className="auth-btn" 
                    style={{backgroundColor: '#ef4444', marginTop:'0'}}
                >
                    Logout
                </button>
            </div>

            <CustomModal 
                isOpen={modal.isOpen} 
                type={modal.type} 
                message={modal.message} 
                onClose={() => setModal({...modal, isOpen: false})} 
            />
        </div>
    );
};

export default MyAccount;