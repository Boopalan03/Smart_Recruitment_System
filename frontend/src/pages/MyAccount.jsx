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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ fontSize: '1.1rem', color: 'var(--muted)', fontWeight: '600' }}>Loading Profile...</div>
            </div>
        );
    }

    const isEmployer = user?.role === 'employer';

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="auth-container" style={{ maxWidth: '960px', width: '100%', padding: '40px' }}>
                <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '8px' }}>
                    {isEmployer ? 'Company Profile' : 'Account Settings'}
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '32px' }}>
                    Update your account details and manage credentials.
                </p>
                
                <div className="my-account-grid">
                    {/* Left Column: Profile Details */}
                    <div style={{ background: 'var(--surface)', paddingRight: '20px' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '20px', color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>👤</span> Personal Details
                        </h3>
                        <form onSubmit={handleUpdate} className="auth-form">
                            <div className="auth-form-group">
                                <label className="auth-label">
                                    {isEmployer ? 'Company Name' : 'Full Name'}
                                </label>
                                <input 
                                    type="text" 
                                    className="auth-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="auth-form-group">
                                <label className="auth-label">Email (Cannot Change)</label>
                                <input 
                                    type="email" 
                                    className="auth-input"
                                    value={formData.email}
                                    disabled
                                />
                            </div>

                            <div className="auth-form-group">
                                <label className="auth-label">Contact Number</label>
                                <input 
                                    type="text" 
                                    className="auth-input"
                                    placeholder="+91 9876543210"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                />
                            </div>

                            {!isEmployer && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                                    <div className="auth-form-group">
                                        <label className="auth-label">Gender</label>
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

                                    <div className="auth-form-group">
                                        <label className="auth-label">Date of Birth</label>
                                        <input 
                                            type="date" 
                                            className="auth-input"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: 'fit-content' }}>
                                Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Security Section */}
                    <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '40px' }} className="my-account-security-wrapper">
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '20px', color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🔒</span> Security & Credentials
                        </h3>
                        
                        <form onSubmit={handleChangePassword} className="auth-form" style={{ gap: '20px' }}>
                            <div className="auth-form-group">
                                <label className="auth-label">New Password</label>
                                <input 
                                    type="password" 
                                    className="auth-input" 
                                    placeholder="Define a new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn-primary" 
                                style={{
                                    width: 'fit-content',
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

                <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid var(--border)' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={logout} 
                        className="btn-outline" 
                        style={{ padding: '12px 24px' }}
                    >
                        Sign Out
                    </button>
                    <button 
                        onClick={handleDeleteAccount} 
                        className="btn-danger" 
                        style={{ padding: '12px 24px' }}
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