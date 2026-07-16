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
        title: '', company: user?.name || '', location: '', jobType: 'Full-time', minSalary: '', description: ''
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

        if (view === 'jobs') fetchMyJobs();
        if (view === 'messages') fetchAllApplications();
    }, [view]);

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            await API.post('/jobs', formData);
            showModal('success', '✅ Job Posted Successfully!');
            setFormData({ title: '', company: user?.name || '', location: '', jobType: 'Full-time', minSalary: '', description: '' });
            setView('jobs');
        } catch  { showModal('error', '❌ Failed to post job.'); }
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
        const url = `http://localhost:5000/${path.replace(/\\/g, '/')}`;
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
                    📥 Messages
                    {allApplications.filter(a => a.status === 'pending').length > 0 && view !== 'messages' && (
                        <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', width: '12px', height: '12px', borderRadius: '50%' }}></span>
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
                            <div><label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Minimum Salary (₹)</label><input type="number" className="auth-input" required value={formData.minSalary} onChange={e => setFormData({...formData, minSalary: e.target.value})} /></div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Job Type</label>
                                <select className="auth-input" value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}>
                                    <option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Internship">Internship</option><option value="Remote">Remote</option>
                                </select>
                            </div>
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
                                <div key={job._id} className="job-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 className="job-title">{job.title}</h3>
                                        <div className="company-name">{job.location} • {job.jobType}</div>
                                        <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '15px'}}>💰 Salary: ₹{job.minSalary}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                        <button className="btn-outline" style={{ flex: 1, textAlign: 'center' }} onClick={() => handleViewApplicants(job._id, job.title)}>
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
                    {applicants.map(app => renderApplicantCard(app, openResume, handleUpdateStatus))}
                </div>
            )}

            {/* TAB: GLOBAL MESSAGES / INBOX */}
            {view === 'messages' && (
                <div>
                    <h3 style={{marginBottom: '20px', color: '#1e293b'}}>📥 Recent Applications Inbox</h3>
                    {allApplications.length === 0 ? (
                        <div className="no-jobs"><h3>Your inbox is empty.</h3></div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
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
    <div key={app._id} className="job-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `5px solid ${app.status === 'accepted' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : '#fbbf24'}` }}>
        <div>
            <h4 style={{fontSize: '1.1rem', marginBottom: '5px', color: '#0f172a'}}>{app.applicant?.name || 'Unknown User'}</h4>
            <div style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '5px'}}>✉️ {app.applicant?.email}</div>
            
            {showJobTitle && (
                <div style={{color: '#2563eb', fontSize: '0.9rem', marginBottom: '10px', fontWeight: 'bold'}}>
                    Applied for: {app.job?.title}
                </div>
            )}
            
            <div>
                <strong>Status: </strong> 
                <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: app.status === 'accepted' ? '#15803d' : app.status === 'rejected' ? '#b91c1c' : '#b45309' }}>
                    {app.status}
                </span>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {app.resume && (
                <button className="btn-outline" style={{borderColor: '#64748b', color: '#475569'}} onClick={() => openResume(app.resume)}>
                    📄 View Resume
                </button>
            )}
            {app.status === 'pending' && (
                <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={() => handleUpdateStatus(app._id, 'accepted')} style={{background: '#22c55e', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>Accept</button>
                    <button onClick={() => handleUpdateStatus(app._id, 'rejected')} style={{background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>Reject</button>
                </div>
            )}
        </div>
    </div>
);

export default EmployerDashboard;