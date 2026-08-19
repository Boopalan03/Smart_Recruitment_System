import { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import CustomModal from '../components/CustomModal';
import { 
    BriefcaseIcon, 
    PlusIcon, 
    DownloadIcon, 
    TrashIcon, 
    InfoIcon, 
    CheckIcon, 
    CloseIcon, 
    LocationIcon, 
    SalaryIcon,
    UserIcon,
    ClockIcon
} from '../components/Icons';

const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
        const past = new Date(dateString);
        if (isNaN(past.getTime())) return '';
        const now = new Date();
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return diffInDays === 1 ? '1 day ago' : `${diffInDays}d ago`;
        }
        
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks}w ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 1) {
            return `${diffInWeeks}w ago`;
        }
        if (diffInMonths < 12) {
            return diffInMonths === 1 ? '1 month ago' : `${diffInMonths}mo ago`;
        }
        
        const diffInYears = Math.floor(diffInDays / 365);
        return diffInYears <= 1 ? '1 year ago' : `${diffInYears}y ago`;
    } catch {
        return '';
    }
};

const EmployerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('jobs'); // 'jobs', 'post', 'applicants', 'messages'
    const [jobs, setJobs] = useState([]);
    const [applicants, setApplicants] = useState([]); 
    const [allApplications, setAllApplications] = useState([]); 
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [selectedJobId, setSelectedJobId] = useState('');
    
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

    useEffect(() => {
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
            setSelectedJobId(jobId);
            setView('applicants');
        } catch { showModal('error', '❌ Failed to fetch applicants.'); }
    };

    const handleDownloadAccepted = async (jobId, title) => {
        try {
            const response = await API.get(`/jobs/employer/download-accepted-csv/${jobId}`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeTitle = (title || 'Job').replace(/[^a-zA-Z0-9_-]/g, '_');
            link.setAttribute('download', `accepted_applicants_${safeTitle}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showModal('success', '✅ Downloaded accepted applicants spreadsheet! The downloaded records have been archived from your employer view.');
            
            fetchMyJobs();
            fetchAllApplications();
            
            // If currently viewing applicants list for this job, refresh list
            if (jobId === selectedJobId) {
                const res = await API.get(`/jobs/employer/applications/${jobId}`);
                setApplicants(res.data);
            }
        } catch (err) {
            if (err.response && err.response.data instanceof Blob) {
                const text = await err.response.data.text();
                try {
                    const parsed = JSON.parse(text);
                    showModal('error', `❌ ${parsed.msg || 'No accepted applicants found to download.'}`);
                    return;
                } catch {
                    showModal('error', '❌ No accepted applicants found to download for this job.');
                    return;
                }
            }
            const msg = err.response?.data?.msg || 'No accepted applicants found to download.';
            showModal('error', `❌ ${msg}`);
        }
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

    // Calculate actual analytics numbers
    const totalJobs = jobs.length;
    const totalApplicants = allApplications.length;
    const totalShortlisted = allApplications.filter(a => a.status === 'accepted').length;
    const totalPending = allApplications.filter(a => a.status === 'pending').length;

    const renderApplicantCard = (app, openResume, handleUpdateStatus, showJobTitle = false) => {
        const appStatus = app.status || 'pending';
        return (
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
                    borderLeft: `5px solid ${appStatus === 'accepted' ? 'var(--success)' : appStatus === 'rejected' ? 'var(--danger)' : 'var(--warning)'}` 
                }}
            >
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--heading)', marginBottom: '8px' }}>
                            {app.applicant?.name || 'Unknown Candidate'}
                        </h4>
                        {app.createdAt && (
                            <span className="posted-time" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--background)', padding: '4px 8px', borderRadius: '30px' }}>
                                <ClockIcon size={12} /> {getRelativeTime(app.createdAt)}
                            </span>
                        )}
                    </div>
                    <div style={{ color: 'var(--text)', fontSize: '0.88rem', marginBottom: '6px', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✉️</span> {app.applicant?.email}
                    </div>
                    {app.applicant?.contact && (
                        <div style={{ color: 'var(--text)', fontSize: '0.88rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📞</span> {app.applicant?.contact}
                        </div>
                    )}
                    
                    {showJobTitle && (
                        <div style={{ color: 'var(--primary)', fontSize: '0.9rem', margin: '8px 0 12px 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BriefcaseIcon size={14} color="var(--primary)" /> Applied for: {app.job?.title || 'Unknown Job'}
                        </div>
                    )}
                    
                    <div style={{ margin: '14px 0', background: 'var(--background)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: 'fit-content' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                            <strong>Status: </strong> 
                            <span style={{ textTransform: 'capitalize', fontWeight: '800', color: appStatus === 'accepted' ? 'var(--success)' : appStatus === 'rejected' ? 'var(--danger)' : 'var(--warning)' }}>
                                {appStatus}
                            </span>
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                    {app.resume && (
                        <button className="btn-outline" style={{ borderColor: 'var(--border)', color: 'var(--text)', width: '100%', padding: '8px' }} onClick={() => openResume(app.resume)}>
                            📄 View Resume
                        </button>
                    )}
                    {appStatus === 'pending' && (
                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                            <button onClick={() => handleUpdateStatus(app._id, 'accepted')} className="btn-success" style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.85rem' }}>Accept</button>
                            <button onClick={() => handleUpdateStatus(app._id, 'rejected')} className="btn-danger" style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.85rem' }}>Reject</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="container">
            <div className="employer-layout">
                {/* SIDEBAR */}
                <aside className="employer-sidebar">
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--heading)', marginBottom: '4px' }}>Employer Panel</h2>
                        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: '500' }}>Logged in as {user?.name}</p>
                    </div>
                    
                    <ul className="sidebar-menu">
                        <li>
                            <button 
                                onClick={() => setView('jobs')} 
                                className={`sidebar-btn ${view === 'jobs' || view === 'applicants' ? 'active' : ''}`}
                            >
                                <BriefcaseIcon size={18} />
                                <span>My Posted Jobs</span>
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => setView('post')} 
                                className={`sidebar-btn ${view === 'post' ? 'active' : ''}`}
                            >
                                <PlusIcon size={18} />
                                <span>Post New Job</span>
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => setView('messages')} 
                                className={`sidebar-btn ${view === 'messages' ? 'active' : ''}`}
                                style={{ position: 'relative' }}
                            >
                                <span>📥</span>
                                <span>Applications Inbox</span>
                                {totalPending > 0 && (
                                    <span style={{ 
                                        position: 'absolute', 
                                        top: '50%', 
                                        right: '16px', 
                                        transform: 'translateY(-50%)',
                                        background: 'var(--danger)', 
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        borderRadius: '30px',
                                        minWidth: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 4px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        {totalPending}
                                    </span>
                                )}
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="employer-main">
                    {/* Top Welcome Title & Analytics statistics */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow)', width: '100%' }}>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--heading)', marginBottom: '4px' }}>Welcome back, {user?.name}</h1>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Manage your jobs, evaluate candidates, and export applications from one secure dashboard.</p>
                        
                        <div className="analytics-grid">
                            <div className="analytic-card">
                                <div className="analytic-icon-container" style={{ background: '#EEF2F6', color: 'var(--primary)' }}>
                                    <BriefcaseIcon size={22} />
                                </div>
                                <div className="analytic-details">
                                    <h3>{totalJobs}</h3>
                                    <span>Active Jobs</span>
                                </div>
                            </div>
                            <div className="analytic-card">
                                <div className="analytic-icon-container" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                                    <span>📥</span>
                                </div>
                                <div className="analytic-details">
                                    <h3>{totalApplicants}</h3>
                                    <span>Applicants</span>
                                </div>
                            </div>
                            <div className="analytic-card">
                                <div className="analytic-icon-container" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                                    <CheckIcon size={22} color="var(--success)" />
                                </div>
                                <div className="analytic-details">
                                    <h3>{totalShortlisted}</h3>
                                    <span>Accepted</span>
                                </div>
                            </div>
                            <div className="analytic-card">
                                <div className="analytic-icon-container" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                                    <InfoIcon size={22} color="var(--danger)" />
                                </div>
                                <div className="analytic-details">
                                    <h3>{totalPending}</h3>
                                    <span>Pending</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TAB: POST JOB */}
                    {view === 'post' && (
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', boxShadow: 'var(--shadow)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--heading)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Create a Job Listing</h3>
                            <form onSubmit={handlePostJob} className="auth-form">
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Basic Information</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                                    <div className="auth-form-group">
                                        <label className="auth-label">Job Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <input type="text" className="auth-input" placeholder="e.g. Senior Software Engineer" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                    </div>
                                    <div className="auth-form-group">
                                        <label className="auth-label">Company Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <input type="text" className="auth-input" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                                    </div>
                                    <div className="auth-form-group">
                                        <label className="auth-label">Location <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <input type="text" className="auth-input" placeholder="e.g. Coimbatore, TN" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                                    </div>
                                    <div className="auth-form-group">
                                        <label className="auth-label">Job Type <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <select className="auth-input" value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '16px', marginBottom: '4px' }}>Job Details</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                    <div className="auth-form-group">
                                        <label className="auth-label">Minimum Salary (₹) <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <input type="number" className="auth-input" placeholder="e.g. 35000" required value={formData.minSalary} onChange={e => setFormData({...formData, minSalary: e.target.value})} />
                                    </div>
                                    <div className="auth-form-group">
                                        <label className="auth-label">Maximum Salary (₹) <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <input type="number" className="auth-input" placeholder="e.g. 80000" required value={formData.maxSalary} onChange={e => setFormData({...formData, maxSalary: e.target.value})} />
                                    </div>
                                    <div className="auth-form-group">
                                        <label className="auth-label">Experience Required (Years) <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <input type="number" className="auth-input" placeholder="e.g. 2" required value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})} />
                                    </div>
                                </div>

                                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '16px', marginBottom: '4px' }}>Description</h4>
                                <div className="auth-form-group">
                                    <label className="auth-label">Job Description <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <textarea className="auth-input" rows="6" placeholder="Provide details regarding roles, responsibilities, requirements, and benefits..." required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>

                                <button type="submit" className="auth-btn" style={{ padding: '12px 24px', fontSize: '1rem', width: 'auto', alignSelf: 'flex-start' }}>
                                    Publish Job
                                </button>
                            </form>
                        </div>
                    )}

                    {/* TAB: MY POSTED JOBS */}
                    {view === 'jobs' && (
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--heading)', marginBottom: '20px' }}>Active Job Listings</h3>
                            {jobs.length === 0 ? (
                                <div className="no-jobs">
                                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💼</div>
                                    <h3>You haven't posted any jobs yet.</h3>
                                    <p>Publish job openings so candidates can apply to join your company.</p>
                                    <button onClick={() => setView('post')} className="btn-primary" style={{ marginTop: '10px' }}>
                                        + Post New Job
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                                    {jobs.map(job => {
                                        const jobApps = allApplications.filter(app => {
                                            const appJobId = typeof app.job === 'object' ? app.job?._id : app.job;
                                            return appJobId && String(appJobId) === String(job._id);
                                        });

                                        return (
                                            <div key={job._id} className="job-card">
                                                <div>
                                                    <div className="job-card-header">
                                                        <div className="job-title-row">
                                                            <h3 className="job-title">{job.title}</h3>
                                                            <div className="company-name-row" style={{ marginTop: '4px' }}>
                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                                                    <LocationIcon size={12} /> {job.location}
                                                                </span>
                                                                <span>•</span>
                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                                                    <BriefcaseIcon size={12} /> {job.jobType}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="job-meta-row" style={{ margin: '14px 0 20px 0' }}>
                                                        <span className="meta-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                            <SalaryIcon size={12} color="var(--primary)" /> ₹{job.minSalary} - ₹{job.maxSalary}
                                                        </span>
                                                        <span className="meta-badge">
                                                            Exp: {job.experienceLevel} Yrs
                                                        </span>
                                                        <span className="meta-badge" style={{ background: '#f5f3ff', color: 'var(--primary)', fontWeight: 'bold' }}>
                                                            {jobApps.length} Applicants
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '15px' }}>
                                                    <button className="btn-primary" style={{ flex: 1, padding: '10px 12px', fontSize: '0.88rem' }} onClick={() => handleViewApplicants(job._id, job.title)}>
                                                        View Applicants
                                                    </button>
                                                    <button 
                                                        className="btn-outline" 
                                                        title="Download Accepted Applicants Spreadsheet (.CSV)"
                                                        style={{ borderColor: 'var(--success)', color: 'var(--success)', padding: '10px 12px' }} 
                                                        onClick={() => handleDownloadAccepted(job._id, job.title)}
                                                    >
                                                        <DownloadIcon size={16} color="var(--success)" />
                                                    </button>
                                                    <button 
                                                        className="btn-outline" 
                                                        style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '10px 12px' }} 
                                                        onClick={() => handleDeleteJob(job._id)}
                                                    >
                                                        <TrashIcon size={16} color="var(--danger)" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: SPECIFIC JOB APPLICANTS */}
                    {view === 'applicants' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                                <div>
                                    <button onClick={() => setView('jobs')} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', marginBottom: '10px' }}>← Back to Jobs</button>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--heading)' }}>Applicants for: {selectedJobTitle}</h3>
                                </div>
                                <button 
                                    className="btn-success" 
                                    style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                                    onClick={() => handleDownloadAccepted(selectedJobId, selectedJobTitle)}
                                >
                                    <DownloadIcon size={16} color="white" />
                                    <span>Download Accepted (.CSV)</span>
                                </button>
                            </div>

                            {applicants.length === 0 ? (
                                <div className="no-jobs">
                                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👥</div>
                                    <h3>No Active Applicants</h3>
                                    <p>No new or pending candidates have applied for this position recently.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', width: '100%' }}>
                                    {applicants.map(app => renderApplicantCard(app, openResume, handleUpdateStatus))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: GLOBAL MESSAGES / INBOX */}
                    {view === 'messages' && (
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--heading)', marginBottom: '20px' }}>📥 Recent Applications Inbox</h3>
                            {allApplications.length === 0 ? (
                                <div className="no-jobs">
                                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📥</div>
                                    <h3>Your inbox is empty.</h3>
                                    <p>When candidates apply to your job listings, their files will appear here.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', width: '100%' }}>
                                    {allApplications.map(app => renderApplicantCard(app, openResume, handleUpdateStatus, true))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

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

export default EmployerDashboard;