import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { SearchIcon, CloseIcon, TrashIcon, BlockIcon, CheckIcon, VerifiedIcon } from '../components/Icons';

const SuperAdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalSeekers: 0,
        totalEmployers: 0,
        verifiedEmployers: 0,
        blockedUsers: 0,
        totalJobs: 0,
        totalApplications: 0
    });
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // all, seekers, employers, blocked
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/users')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setFilteredUsers(usersRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'superadmin') {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        let result = users;

        if (activeTab === 'seekers') {
            result = result.filter(u => u.role === 'seeker');
        } else if (activeTab === 'employers') {
            result = result.filter(u => u.role === 'employer');
        } else if (activeTab === 'blocked') {
            result = result.filter(u => u.isBlocked);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(u => 
                u.name.toLowerCase().includes(query) || 
                u.email.toLowerCase().includes(query)
            );
        }

        setFilteredUsers(result);
    }, [searchQuery, activeTab, users]);

    const handleVerify = async (id, currentStatus) => {
        try {
            if (currentStatus) {
                await API.put(`/admin/users/${id}/unverify`);
            } else {
                await API.put(`/admin/users/${id}/verify`);
            }
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to update verification status');
        }
    };

    const handleBlock = async (id, currentStatus) => {
        const action = currentStatus ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        
        try {
            await API.put(`/admin/users/${id}/${action}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert(`Failed to ${action} user`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you absolutely sure? This will delete the user and all their associated data (jobs/applications) permanently.')) return;
        
        try {
            await API.delete(`/admin/users/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete user');
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin Dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '24px' }}>Super Admin Dashboard</h1>
            
            {/* STATS CARDS */}
            <div className="stats-grid" style={{ marginBottom: '40px' }}>
                <div className="stat-card">
                    <div className="stat-number">{stats.totalSeekers}</div>
                    <div className="stat-label">Total Seekers</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.totalEmployers}</div>
                    <div className="stat-label">Total Employers</div>
                </div>
                <div className="stat-card" style={{ borderColor: 'var(--primary)' }}>
                    <div className="stat-number" style={{ color: 'var(--primary)' }}>{stats.verifiedEmployers}</div>
                    <div className="stat-label">Verified Employers</div>
                </div>
                <div className="stat-card" style={{ borderColor: 'var(--danger)' }}>
                    <div className="stat-number" style={{ color: 'var(--danger)' }}>{stats.blockedUsers}</div>
                    <div className="stat-label">Blocked Users</div>
                </div>
            </div>

            {/* USERS TABLE AREA */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    
                    <div className="tabs">
                        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Users</button>
                        <button className={`tab-btn ${activeTab === 'seekers' ? 'active' : ''}`} onClick={() => setActiveTab('seekers')}>Seekers</button>
                        <button className={`tab-btn ${activeTab === 'employers' ? 'active' : ''}`} onClick={() => setActiveTab('employers')}>Employers</button>
                        <button className={`tab-btn ${activeTab === 'blocked' ? 'active' : ''}`} onClick={() => setActiveTab('blocked')} style={{ color: activeTab === 'blocked' ? 'var(--danger)' : '' }}>Blocked</button>
                    </div>

                    <div className="search-bar" style={{ width: '300px' }}>
                        <SearchIcon size={20} color="var(--muted)" />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search name or email..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(u => (
                                    <tr key={u._id}>
                                        <td>
                                            <div style={{ fontWeight: '500' }}>{u.name}</div>
                                        </td>
                                        <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                                        <td>
                                            <span className={`role-badge ${u.role}`}>{u.role}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {u.role === 'employer' && (
                                                    <span className={`status-badge ${u.isVerified ? 'verified' : 'unverified'}`}>
                                                        {u.isVerified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                )}
                                                {u.isBlocked && (
                                                    <span className="status-badge blocked">Blocked</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--muted)' }}>
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="admin-actions">
                                                {u.role === 'employer' && (
                                                    <button 
                                                        onClick={() => handleVerify(u._id, u.isVerified)}
                                                        className={`icon-btn ${u.isVerified ? 'warning' : 'success'}`}
                                                        title={u.isVerified ? "Remove Verification" : "Verify Employer"}
                                                    >
                                                        {u.isVerified ? <CloseIcon size={18} /> : <CheckIcon size={18} />}
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleBlock(u._id, u.isBlocked)}
                                                    className={`icon-btn ${u.isBlocked ? 'success' : 'warning'}`}
                                                    title={u.isBlocked ? "Unblock User" : "Block User"}
                                                >
                                                    <BlockIcon size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(u._id)}
                                                    className="icon-btn danger"
                                                    title="Delete User Permanently"
                                                >
                                                    <TrashIcon size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
