import { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import CustomModal from '../components/CustomModal';

const EmployerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('jobs'); // 'jobs', 'post', 'applicants', 'messages'
    const [jobs, setJobs] = useState([]);
    const [applicants, setApplicants] = useState([]); 
    const [allApplications, setAllApplications] = useState([]); 
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    
    const [modal, setModal] = useState({ isOpen: false, type: 'info', message: '', showCancel: false, onConfirm: null });

    const [formData, setFormData] = useState({
        title: '',
        company: user?.name || '',
        location: '',
        jobType: 'Full-time',
        minSalary: '',
        maxSalary: '',
        experienceLevel: '',
        description: ''
    });

    const showModal = (type, message, showCancel = false, onConfirm = null) => setModal({ isOpen: true, type, message, showCancel, onConfirm });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                const res = await API.get('/jobs/employer/my-jobs');
                setJobs(res.data);
            } catch (err) { console.error(err); }
        };

        const fetchAllApplications = async () => {
            try {
                const res = await API.get('/jobs/employer/all-applications');
                setAllApplications(res.data);
            } catch (err) { console.error(err); }
        };

        fetchMyJobs();
        fetchAllApplications();

        const interval = setInterval(() => {
            fetchMyJobs();
            fetchAllApplications();
        }, 10000);

        return () => clearInterval(interval);
    }, [view]);

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            await API.post('/jobs', formData);
            showModal('success', '✅ Job Posted Successfully!');
            setFormData({
                title: '',
                company: user?.name || '',
                location: '',
                jobType: 'Full-time',
                minSalary: '',
                maxSalary: '',
                experienceLevel: '',
                description: ''
            });
            setView('jobs');
        } catch (err) {
            const errorMsg = err.response?.data?.msg || err.response?.data || 'Failed to post job.';
            showModal('error', `❌ ${errorMsg}`);
        }
    };

    const handleViewApplicants = async (jobId, title) => {
        try {
            const res = await API.get(`/jobs/employer/applications/${jobId}`);
            setApplicants(res.data);
            setSelectedJobTitle(title);
            setView('applicants');
        } catch { showModal('error', '❌ Failed to fetch applicants.'); }
    };

    const handleDeleteJob = (jobId) => {
        showModal(
            'error', 
            'Are you sure you want to delete this job listing? This will also delete all applications for this job.', 
            true, 
            async () => {
                try {
                    await API.delete(`/jobs/${jobId}`);
                    showModal('success', '🗑️ Job Listing Deleted Successfully!');
                    setJobs(jobs.filter(job => job._id !== jobId));
                } catch (err) {
                    const errorMsg = err.response?.data?.msg || 'Failed to delete job.';
                    showModal('error', `❌ Error: ${errorMsg}`);
                }
            }
        );
    };

    const handleUpdateStatus = async (appId, status) => {
        try {
            await API.put(`/jobs/application/${appId}/status`, { status });
            showModal('success', `✅ Applicant marked as ${status}`);
            
            // Instantly update UI locally
            setApplicants(applicants.map(app => app._id === appId ? { ...app, status } : app));
            setAllApplications(allApplications.map(app => app._id === appId ? { ...app, status } : app));
        } catch { showModal('error', '❌ Failed to update status.'); }
    };

    const openResume = (path) => {
        if (!path) return;
        if (path.startsWith('http://') || path.startsWith('https://')) {
            window.open(path, '_blank');
            return;
        }
        const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const formattedPath = path.replace(/\\/g, '/');
        const url = `${backendBase}/${formattedPath.startsWith('/') ? formattedPath.slice(1) : formattedPath}`;
        window.open(url, '_blank');
    };

    return (
        <div className="container" style={{ display: 'block' }}>
            <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '20px' }}>Employer Panel</h2>
            
            <div style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
                <button onClick={() => setView('jobs')} className={view === 'jobs' || view === 'applicants' ? 'btn-primary' : 'btn-outline'}>
                    My Posted Jobs
                </button>
                <button onClick={() => setView('post')} className={view === 'post' ? 'btn-primary' : 'btn-outline'}>
                    + Post New Job
                </button>
                <button onClick={() => setView('messages')} className={view === 'messages' ? 'btn-primary' : 'btn-outline'} style={{position: 'relative'}}>
                    📥 View Applications
                    {allApplications.filter(a => a.status === 'pending').length > 0 && (
                        <span style={{ 
                            position: 'absolute', 
                            top: '-8px', 
                            right: '-8px', 
                            background: '#ef4444', 
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            borderRadius: '50%',
                            minWidth: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}>
                            {allApplications.filter(a => a.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {/* TAB: POST JOB */}
            {view === 'post' && (
                <div className="auth-container" style={{ margin: '0', maxWidth: '800px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Create a Job Listing</h3>
                    <form onSubmit={handlePostJob} className="auth-form">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div><label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Job Title</label><input type="text" className="auth-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                            <div><label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Company Name</label><input type="text" className="auth-input" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} /></div>
                            <div><label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Location</label><input type="text" className="auth-input" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                            <div>
                                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Job Type</label>
                                <select className="auth-input" value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}>
                                    <option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Internship">Internship</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div><label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Minimum Salary (₹)</label><input type="number" className="auth-input" required value={formData.minSalary} onChange={e => setFormData({...formData, minSalary: e.target.value})} /></div>
                            <div><label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Maximum Salary (₹)</label><input type="number" className="auth-input" required value={formData.maxSalary} onChange={e => setFormData({...formData, maxSalary: e.target.value})} /></div>
                            <div style={{ gridColumn: 'span 2' }}><label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Experience Level (Years)</label><input type="number" className="auth-input" required value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})} /></div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Job Description</label>
                                <textarea className="auth-input" rows="5" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                        </div>
                        <button type="submit" className="auth-btn">Post Job</button>
                    </form>
                </div>
            )}

            {/* TAB: MY POSTED JOBS */}
            {view === 'jobs' && (
                <div>
                    {jobs.length === 0 ? (
                        <div className="no-jobs"><h3>You haven't posted any jobs yet.</h3></div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                            {jobs.map(job => (
                                <div key={job._id} className="job-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', marginBottom: 0 }}>
                                    <div>
                                        <h3 className="job-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{job.title}</h3>
                                        <div className="company-name" style={{ color: '#4f46e5', fontWeight: '600', marginBottom: '12px' }}>
                                            📍 {job.location} • 💼 {job.jobType}
                                        </div>
                                        <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '15px'}}>💰 Salary: ₹{job.minSalary} - ₹{job.maxSalary} • 💼 Exp: {job.experienceLevel} Yrs</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                        <button className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '10px' }} onClick={() => handleViewApplicants(job._id, job.title)}>
                                            View Applicants
                                        </button>
                                        <button className="btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444', padding: '10px 15px' }} onClick={() => handleDeleteJob(job._id)}>
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: SPECIFIC JOB APPLICANTS */}
            {view === 'applicants' && (
                <div>
                    <button onClick={() => setView('jobs')} className="btn-outline" style={{marginBottom: '20px'}}>← Back to Jobs</button>
                    <h3 style={{marginBottom: '20px'}}>Applicants for: {selectedJobTitle}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', width: '100%' }}>
                        {applicants.map(app => renderApplicantCard(app, openResume, handleUpdateStatus))}
                    </div>
                </div>
            )}

            {/* TAB: GLOBAL MESSAGES / INBOX */}
            {view === 'messages' && (
                <div>
                    <h3 style={{marginBottom: '20px', color: '#1e293b'}}>📥 Recent Applications Inbox</h3>
                    {allApplications.length === 0 ? (
                        <div className="no-jobs"><h3>Your inbox is empty.</h3></div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', width: '100%' }}>
                            {allApplications.map(app => renderApplicantCard(app, openResume, handleUpdateStatus, true))}
                        </div>
                    )}
                </div>
            )}

            <CustomModal 
                isOpen={modal.isOpen} 
                type={modal.type} 
                message={modal.message} 
                showCancel={modal.showCancel}
                onConfirm={modal.onConfirm}
                onClose={closeModal} 
            />
        </div>
    );
};

// Extracted UI element for consistency across tabs
const renderApplicantCard = (app, openResume, handleUpdateStatus, showJobTitle = false) => (
    <div 
        key={app._id} 
        className="job-card" 
        style={{ 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            height: '100%', 
            marginBottom: '0',
            borderLeft: `5px solid ${app.status === 'accepted' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : '#fbbf24'}` 
        }}
    >
        <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                {app.applicant?.name || 'Unknown User'}
            </h4>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '12px', wordBreak: 'break-all' }}>
                ✉️ {app.applicant?.email}
            </div>
            
            {showJobTitle && (
                <div style={{ color: '#4f46e5', fontSize: '0.9rem', marginBottom: '14px', fontWeight: '700' }}>
                    💼 Applied for: {app.job?.title || 'Unknown Job'}
                </div>
            )}
            
            <div style={{ marginBottom: '18px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                <span style={{ fontSize: '0.88rem', color: '#475569' }}>
                    <strong>Status: </strong> 
                    <span style={{ textTransform: 'capitalize', fontWeight: '800', color: app.status === 'accepted' ? '#16a34a' : app.status === 'rejected' ? '#ef4444' : '#d97706' }}>
                        {app.status}
                    </span>
                </span>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
            {app.resume && (
                <button className="btn-outline" style={{ borderColor: '#64748b', color: '#475569', width: '100%', padding: '10px' }} onClick={() => openResume(app.resume)}>
                    📄 View Resume
                </button>
            )}
            {app.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button onClick={() => handleUpdateStatus(app._id, 'accepted')} style={{ flex: 1, background: '#22c55e', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Accept</button>
                    <button onClick={() => handleUpdateStatus(app._id, 'rejected')} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                </div>
            )}
        </div>
    </div>
);

export default EmployerDashboard;