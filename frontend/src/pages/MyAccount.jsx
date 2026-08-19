import { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import CustomModal from '../components/CustomModal';

const MyAccount = () => {
    const { user, logout, updateUser } = useContext(AuthContext); // Get user role from context
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, type: 'info', message: '' });
    
    // Password Reset states
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    
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
            const res = await API.put('/auth/update-profile', formData);
            if (res.data && res.data.user) {
                updateUser({
                    id: res.data.user._id || res.data.user.id,
                    name: res.data.user.name,
                    email: res.data.user.email,
                    role: res.data.user.role
                });
            }
            setModal({ isOpen: true, type: 'success', message: '✅ Profile Updated Successfully!' });
        } catch {
            setModal({ isOpen: true, type: 'error', message: '❌ Failed to update profile.' });
        }
    };

    // 3. Change Password
    const handleChangePassword = async (e) => {
        if (e) e.preventDefault();
        if (!newPassword) {
            setModal({ isOpen: true, type: 'error', message: 'Please enter a new password.' });
            return;
        }
        setPasswordLoading(true);
        try {
            const res = await API.post('/auth/reset-password', { email: formData.email, newPassword });
            setModal({ isOpen: true, type: 'success', message: `✅ ${res.data.msg || 'Password Changed Successfully!'}` });
            setNewPassword('');
        } catch (err) {
            setModal({ isOpen: true, type: 'error', message: err.response?.data?.msg || 'Failed to change password.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    // 5. Delete Account Handler
    const handleDeleteAccount = () => {
        setModal({
            isOpen: true,
            type: 'error',
            title: 'Confirmation Required',
            message: '⚠️ WARNING: Are you sure you want to permanently delete your account? This action is irreversible and all your details will be erased.',
            showCancel: true,
            onConfirm: async () => {
                try {
                    await API.delete('/auth/delete-account');
                    setModal({
                        isOpen: true,
                        type: 'success',
                        title: 'Account Deleted',
                        message: 'Your account has been deleted successfully.',
                        showCancel: false,
                        onConfirm: () => {
                            logout();
                        }
                    });
                } catch (err) {
                    setModal({
                        isOpen: true,
                        type: 'error',
                        message: err.response?.data?.msg || 'Failed to delete account. Please try again.',
                        showCancel: false,
                        onConfirm: null
                    });
                }
            }
        });
    };

    if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading Profile...</div>;

    return (
        <div className="container" style={{justifyContent: 'center'}}>
            <div className="auth-container" style={{maxWidth: '900px', width: '100%'}}>
                <h2 className="auth-title">
                    {user?.role === 'employer' ? 'Company Profile' : 'My Account'}
                </h2>
                
                <div className="my-account-grid">
                    
                    {/* Left Column: Profile Details */}
                    <div>
                        <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '15px', color: '#1e293b'}}>
                            👤 Profile Details
                        </h3>
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
                            {(user?.role === 'seeker' || user?.role === 'jobseeker') && (
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px'}}>
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
                    </div>

                    {/* Right Column: Password Reset Section */}
                    <div className="my-account-security">
                        <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '15px', color: '#1e293b'}}>
                            🔒 Change Password
                        </h3>
                        
                        <form onSubmit={handleChangePassword} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <div>
                                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>New Password</label>
                                <input 
                                    type="password" 
                                    className="auth-input" 
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="auth-btn" 
                                style={{
                                    marginTop: '5px', 
                                    backgroundColor: '#4f46e5', 
                                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                                    opacity: passwordLoading || !newPassword ? 0.7 : 1,
                                    cursor: passwordLoading || !newPassword ? 'not-allowed' : 'pointer'
                                }}
                                disabled={passwordLoading || !newPassword}
                            >
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>

                </div>

                <hr style={{margin: '35px 0', border: '0', borderTop: '1px solid #e2e8f0'}} />
                
                <div style={{display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap'}}>
                    <button 
                        onClick={logout} 
                        className="auth-btn" 
                        style={{backgroundColor: '#475569', boxShadow: '0 4px 12px rgba(71, 85, 105, 0.2)', marginTop:'0', width: 'auto', padding: '12px 30px'}}
                    >
                        Logout
                    </button>
                    <button 
                        onClick={handleDeleteAccount} 
                        className="auth-btn" 
                        style={{backgroundColor: '#ef4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)', marginTop:'0', width: 'auto', padding: '12px 30px'}}
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            <CustomModal 
                isOpen={modal.isOpen} 
                type={modal.type} 
                title={modal.title}
                message={modal.message} 
                showCancel={modal.showCancel}
                onConfirm={modal.onConfirm}
                onClose={() => setModal({...modal, isOpen: false})} 
            />
        </div>
    );
};

export default MyAccount;