import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api';
import CustomModal from '../components/CustomModal';
import { 
    SearchIcon, 
    LocationIcon, 
    SalaryIcon, 
    BriefcaseIcon, 
    ClockIcon, 
    BookmarkIcon, 
    CloseIcon, 
    DownloadIcon,
    InfoIcon,
    CheckIcon
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

const SeekerDashboard = () => {
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'feed';
    
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [view, setView] = useState('feed'); 
    const [selectedResume, setSelectedResume] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, type: 'info', message: '' });
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeApplyJob, setActiveApplyJob] = useState(null);
    const [bookmarkedJobs, setBookmarkedJobs] = useState(() => {
        // Hydrate from localStorage if desired
        try {
            const saved = localStorage.getItem('bookmarked_jobs');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const filterRef = useRef(null);
    const filterButtonRef = useRef(null);

    // Sync tab param from URL to the local view state
    useEffect(() => {
        setView(tab);
    }, [tab]);

    // Close filter pop-up when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showSidebar &&
                filterRef.current &&
                !filterRef.current.contains(event.target) &&
                filterButtonRef.current &&
                !filterButtonRef.current.contains(event.target)
            ) {
                setShowSidebar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSidebar]);

    // State for Locations
    const [locationOptions, setLocationOptions] = useState([]);

    const [filters, setFilters] = useState({
        location: '',
        jobType: '',
        minSalary: 0,
        search: ''
    });

    // Modal Helpers
    const showModal = (type, message) => setModal({ isOpen: true, type, message });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    // Toggle Bookmarks locally
    const handleBookmark = (jobId, event) => {
        event.stopPropagation();
        setBookmarkedJobs(prev => {
            const isBookmarked = prev.includes(jobId);
            const updated = isBookmarked ? prev.filter(id => id !== jobId) : [...prev, jobId];
            localStorage.setItem('bookmarked_jobs', JSON.stringify(updated));
            return updated;
        });
    };

    // Fetch Locations Dynamically
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await API.get('/jobs/locations');
                const uniqueLocations = res.data.filter(loc => loc); 
                setLocationOptions(uniqueLocations);
            } catch {
                console.error("Failed to fetch locations");
            }
        };
        fetchLocations();
    }, []); // Runs once on mount

    // Fetch Jobs (Based on Filters)
    useEffect(() => {
        if (view === 'feed') {
            const fetchJobs = async () => {
                try {
                    const queryParams = new URLSearchParams();
                    if (filters.search) queryParams.append('search', filters.search);
                    if (filters.location) queryParams.append('location', filters.location);
                    if (filters.jobType) queryParams.append('jobType', filters.jobType);
                    if (filters.minSalary > 0) queryParams.append('minSalary', filters.minSalary);

                    const res = await API.get(`/jobs?${queryParams.toString()}`);
                    setJobs(Array.isArray(res.data) ? res.data : []);
                } catch (err) {
                    console.error("Error fetching jobs:", err);
                }
            };
            const timer = setTimeout(() => { fetchJobs(); }, 500);
            return () => clearTimeout(timer);
        }
    }, [filters, view]);

    // Reusable function to fetch user applications
    const fetchMyApps = async () => {
        try { 
            const res = await API.get('/jobs/my-applications'); 
            setMyApplications(res.data); 
        } catch (err) { 
            console.error("Error fetching applications:", err); 
        }
    };

    // Fetch Applications on Mount or View Change
    useEffect(() => {
        fetchMyApps();
    }, [view]);

    // Helper to Remove/Clear File
    const handleRemoveFile = (jobId) => {
        setSelectedResume(null);
        const fileInput = document.getElementById(`file-input-${jobId}`);
        const label = document.getElementById(`file-label-${jobId}`);
        const nameSpan = document.getElementById(`file-name-${jobId}`);
        const removeBtn = document.getElementById(`remove-btn-${jobId}`);

        if (fileInput) fileInput.value = "";
        if (label) label.classList.remove('selected');
        if (nameSpan) nameSpan.textContent = "No file chosen";
        if (removeBtn) removeBtn.style.display = "none";
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
    };

    const handleApply = async (id) => {
        if (!selectedResume) {
            showModal('error', "⚠️ Please choose a resume file first!");
            return;
        }
        const formData = new FormData();
        formData.append('resume', selectedResume);

        try {
            await API.post(`/jobs/${id}/apply`, formData);
            showModal('success', '✅ Application Submitted Successfully!');
            handleRemoveFile(id);
            // Refresh applications list so the UI immediately updates to "Applied"
            fetchMyApps();
            // Close application popup modal on success
            setActiveApplyJob(null);
        } catch (err) {
            const msg = err.response?.data?.msg || err.response?.data || 'Server Error';
            showModal('error', `❌ Application Failed: ${msg}`);
        }
    };

    const getCompanyInitials = (name) => {
        if (!name) return 'C';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const renderApplicationTimeline = (status) => {
        const isPending = status === 'pending';
        const isAccepted = status === 'accepted';
        const isRejected = status === 'rejected';

        return (
            <div className="app-timeline">
                <div className="timeline-step completed">
                    <div className="timeline-dot">1</div>
                    <div className="timeline-label">Applied</div>
                </div>
                <div className={`timeline-step ${!isPending ? 'completed' : 'active'}`}>
                    <div className="timeline-dot">2</div>
                    <div className="timeline-label">Reviewed</div>
                </div>
                {isAccepted && (
                    <div className="timeline-step completed accepted">
                        <div className="timeline-dot"><CheckIcon size={12} color="white" /></div>
                        <div className="timeline-label" style={{ color: 'var(--success)' }}>Accepted</div>
                    </div>
                )}
                {isRejected && (
                    <div className="timeline-step completed rejected">
                        <div className="timeline-dot">✖</div>
                        <div className="timeline-label" style={{ color: 'var(--danger)' }}>Rejected</div>
                    </div>
                )}
                {isPending && (
                    <div className="timeline-step active">
                        <div className="timeline-dot">⌛</div>
                        <div className="timeline-label" style={{ color: 'var(--warning)' }}>Under Review</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container">
            <div className="feed">
                {view === 'feed' && (
                    <div className="feed-header">
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--heading)', marginBottom: '6px' }}>
                            Find your next opportunity
                        </h2>
                        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                            Search thousands of jobs based on your skills, location, and experience.
                        </p>
                    </div>
                )}

                {view === 'feed' && (
                    <div className="search-bar-container" style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                            <span style={{ position: 'absolute', left: '16px', color: 'var(--muted)' }}><SearchIcon size={20} /></span>
                            <input 
                                type="text" 
                                className="search-input" 
                                style={{ paddingLeft: '48px' }}
                                placeholder="Search jobs by title, company, or keyword..." 
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                            />
                        </div>
                        <button 
                            ref={filterButtonRef}
                            type="button"
                            className="btn-outline"
                            onClick={() => setShowSidebar(!showSidebar)}
                            style={{
                                background: showSidebar ? 'var(--primary)' : 'var(--surface)',
                                color: showSidebar ? 'white' : 'var(--primary)',
                                borderColor: 'var(--primary)',
                                transition: 'var(--transition)'
                            }}
                        >
                            <span>🎛️</span>
                            <span>Filters</span>
                        </button>

                        {/* POP-UP FILTERS OVERLAY */}
                        {showSidebar && (
                            <div ref={filterRef} className="sidebar" style={{
                                position: 'absolute',
                                top: 'calc(100% + 12px)',
                                right: 0,
                                zIndex: 999,
                                width: '320px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
                                padding: '24px',
                                textAlign: 'left'
                            }}>
                                <div className="filter-header">
                                    <span>Filters</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowSidebar(false)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--muted)' }}
                                    >
                                        <CloseIcon size={20} />
                                    </button>
                                </div>

                                <div className="filter-group">
                                    <h4>Job Type</h4>
                                    {['Full-time', 'Part-time', 'Remote', 'Internship'].map((type) => (
                                        <label key={type} className="checkbox-label">
                                            <input 
                                                type="checkbox" 
                                                checked={filters.jobType === type}
                                                onChange={() => handleFilterChange('jobType', type)}
                                            />
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="filter-group">
                                    <h4 style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Min Salary</span>
                                        <span style={{ color: 'var(--primary)', textTransform: 'none' }}>₹{filters.minSalary}</span>
                                    </h4>
                                    <input 
                                        type="range" min="0" max="200000" step="10000"
                                        value={filters.minSalary}
                                        onChange={(e) => setFilters({...filters, minSalary: Number(e.target.value)})}
                                    />
                                </div>

                                <div className="filter-group">
                                    <h4>Location</h4>
                                    <div className="filter-scroll-list">
                                        {locationOptions.length > 0 ? (
                                            locationOptions.map((loc) => (
                                                <label key={loc} className="checkbox-label" style={{ cursor: 'pointer' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={filters.location === loc}
                                                        onChange={() => handleFilterChange('location', loc)}
                                                    />
                                                    <span>{loc}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '10px' }}>No active locations</div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    className="btn-outline" 
                                    style={{ width: '100%', marginTop: '10px' }}
                                    onClick={() => setFilters({ location: '', jobType: '', minSalary: 0, search: '' })}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'feed' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {(() => {
                            const safeJobs = Array.isArray(jobs) ? jobs : [];
                            const safeApps = Array.isArray(myApplications) ? myApplications : [];
                            const availableJobs = safeJobs.filter(job => {
                                if (!job || !job._id) return false;
                                return !safeApps.some(app => {
                                    if (!app) return false;
                                    const appJobId = typeof app.job === 'object' ? app.job?._id : app.job;
                                    return appJobId && String(appJobId) === String(job._id);
                                });
                            });

                            return availableJobs.length > 0 ? (
                                availableJobs.map(job => {
                                    const isBookmarked = bookmarkedJobs.includes(job._id);
                                    return (
                                        <div key={job._id} className="job-card">
                                            <div>
                                                <div className="job-card-header">
                                                    <div className="company-logo-placeholder">
                                                        {getCompanyInitials(job.company)}
                                                    </div>
                                                    <div className="job-title-row">
                                                        <h3 className="job-title">{job.title}</h3>
                                                        <div className="company-name-row">
                                                            <span>{job.company}</span>
                                                            {job.location && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                                                        <LocationIcon size={12} /> {job.location}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => handleBookmark(job._id, e)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: isBookmarked ? 'var(--primary)' : 'var(--muted)', display: 'flex', alignItems: 'center', transition: 'var(--transition)' }}
                                                        title={isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
                                                    >
                                                        <BookmarkIcon size={20} fill={isBookmarked ? "var(--primary)" : "none"} />
                                                    </button>
                                                </div>
                                                
                                                <div className="job-meta-row">
                                                    <span className="meta-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <SalaryIcon size={12} color="var(--primary)" /> ₹{typeof job.minSalary === 'number' || typeof job.minSalary === 'string' ? job.minSalary : (job.salary && typeof job.salary === 'object' ? `${job.salary.min || ''} - ${job.salary.max || ''}` : job.salary || 'N/A')}
                                                    </span>
                                                    <span className="meta-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <BriefcaseIcon size={12} color="var(--primary)" /> {job.jobType || 'Full-time'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="job-card-footer">
                                                {job.createdAt ? (
                                                    <span className="posted-time" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <ClockIcon size={12} /> {getRelativeTime(job.createdAt)}
                                                    </span>
                                                ) : <span />}
                                                <button 
                                                    className="btn-primary" 
                                                    style={{ padding: '8px 16px', fontSize: '0.88rem' }} 
                                                    onClick={() => setActiveApplyJob(job)}
                                                >
                                                    Apply Now
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-jobs" style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔍</div>
                                    <h3>{safeJobs.length > 0 ? "You're All Caught Up!" : "No Jobs Found"}</h3>
                                    <p>{safeJobs.length > 0 ? "You have applied to all matching jobs. Check back later or adjust your search filters." : "We couldn't find any jobs matching your current search terms. Try clearing or expanding your filters."}</p>
                                    <button 
                                        className="btn-outline" 
                                        style={{ marginTop: '10px' }}
                                        onClick={() => setFilters({ location: '', jobType: '', minSalary: 0, search: '' })}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {view === 'applications' && (
                    <>
                        <div className="feed-header">
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--heading)', marginBottom: '6px' }}>
                                My Applications
                            </h2>
                            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                                Track and manage the real-time status of your submitted job applications.
                            </p>
                        </div>
                        
                        {myApplications.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', width: '100%' }}>
                                {myApplications.map(app => {
                                    const appStatus = app.status || 'pending';
                                    return (
                                        <div 
                                            key={app._id} 
                                            className={`app-tracker-card app-status-${appStatus}`}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h3 className="job-title" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                                                        {app.job?.title || 'Job Listing (Archived)'}
                                                    </h3>
                                                    <div style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                                                        {app.job?.company || 'Company Listing'}
                                                    </div>
                                                </div>
                                                {app.createdAt && (
                                                    <span className="posted-time" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--background)', padding: '4px 8px', borderRadius: '30px' }}>
                                                        <ClockIcon size={12} /> {getRelativeTime(app.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Status Banner */}
                                            <div className={`app-status-banner ${appStatus}`}>
                                                <span style={{ textTransform: 'capitalize', fontWeight: '700' }}>
                                                    {appStatus === 'accepted' ? '🟢 Accepted' : appStatus === 'rejected' ? '🔴 Rejected' : '🟡 Under Review'}
                                                </span>
                                                {appStatus === 'accepted' && (
                                                    <p style={{ fontSize: '0.82rem', marginTop: '4px', color: '#047857', fontWeight: '500' }}>
                                                        You will receive an email shortly regarding the next steps in the interview.
                                                    </p>
                                                )}
                                                {appStatus === 'rejected' && (
                                                    <p style={{ fontSize: '0.82rem', marginTop: '4px', color: '#B91C1C', fontWeight: '500' }}>
                                                        Thank you for applying. We encourage you to apply for other matching roles.
                                                    </p>
                                                )}
                                                {appStatus === 'pending' && (
                                                    <p style={{ fontSize: '0.82rem', marginTop: '4px', color: '#B45309', fontWeight: '500' }}>
                                                        The hiring team is currently reviewing your resume and credentials.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Interactive Visual Timeline */}
                                            {renderApplicationTimeline(appStatus)}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="no-jobs" style={{ width: '100%', padding: '60px 20px' }}>
                                <div style={{ fontSize: '3.2rem', marginBottom: '12px' }}>📋</div>
                                <h3>No Applications Found</h3>
                                <p>You haven't submitted any job applications yet. Start exploring active opportunities and submit your profile today!</p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => {
                                        setView('feed');
                                        window.history.pushState(null, '', '/dashboard?tab=feed');
                                    }}
                                    style={{ padding: '12px 26px', fontSize: '0.95rem' }}
                                >
                                    🔍 Find My Job
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <CustomModal isOpen={modal.isOpen} type={modal.type} message={modal.message} onClose={closeModal} />

            {/* JOB APPLICATION MODAL POPUP */}
            {activeApplyJob && (
                <div className="modal-overlay" onClick={() => { setActiveApplyJob(null); handleRemoveFile(activeApplyJob._id); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px 24px', borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--heading)', margin: 0 }}>
                                Apply for {activeApplyJob.title}
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => { setActiveApplyJob(null); handleRemoveFile(activeApplyJob._id); }} 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
                            >
                                <CloseIcon size={20} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ textAlign: 'left', padding: '24px', maxHeight: 'calc(80vh - 150px)', overflowY: 'auto' }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>🏢 {activeApplyJob.company}</span>
                                {activeApplyJob.location && <span style={{ color: 'var(--muted)', fontSize: '0.95rem', marginLeft: '10px' }}>📍 {activeApplyJob.location}</span>}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                                <span className="meta-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <SalaryIcon size={12} color="var(--primary)" /> ₹{typeof activeApplyJob.minSalary === 'number' || typeof activeApplyJob.minSalary === 'string' ? activeApplyJob.minSalary : (activeApplyJob.salary && typeof activeApplyJob.salary === 'object' ? `${activeApplyJob.salary.min || ''} - ${activeApplyJob.salary.max || ''}` : activeApplyJob.salary || 'N/A')}
                                </span>
                                <span className="meta-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <BriefcaseIcon size={12} color="var(--primary)" /> {activeApplyJob.jobType || 'Full-time'}
                                </span>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--heading)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <InfoIcon size={16} color="var(--primary)" /> Job Description
                                </h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'pre-line', lineHeight: '1.6', background: 'var(--background)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border)', maxHeight: '180px', overflowY: 'auto' }}>
                                    {activeApplyJob.description}
                                </p>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--heading)', marginBottom: '10px' }}>
                                    Upload Your Resume
                                </h4>
                                
                                <div className="file-upload-wrapper">
                                    <input 
                                        id={`file-input-${activeApplyJob._id}`}
                                        type="file" accept=".pdf,.doc,.docx" className="hidden-input"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setSelectedResume(file);
                                            const label = document.getElementById(`file-label-${activeApplyJob._id}`);
                                            const nameSpan = document.getElementById(`file-name-${activeApplyJob._id}`);
                                            const removeBtn = document.getElementById(`remove-btn-${activeApplyJob._id}`);

                                            if (file) {
                                                label.classList.add('selected');
                                                nameSpan.textContent = file.name;
                                                removeBtn.style.display = "inline-block";
                                            } else {
                                                handleRemoveFile(activeApplyJob._id);
                                            }
                                        }}
                                    />
                                    <label id={`file-label-${activeApplyJob._id}`} htmlFor={`file-input-${activeApplyJob._id}`} className="custom-file-btn">
                                        <DownloadIcon size={24} color="var(--primary)" />
                                        <span>Click to browse and upload resume</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--muted)' }}>Supports PDF, DOC, DOCX up to 5MB</span>
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', background: 'var(--background)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <span id={`file-name-${activeApplyJob._id}`} style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>No file chosen</span>
                                        <button id={`remove-btn-${activeApplyJob._id}`} type="button" className="remove-file-btn" onClick={() => handleRemoveFile(activeApplyJob._id)} style={{ display: 'none' }}>✖</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-primary" style={{ flex: 1, padding: '12px' }} onClick={() => handleApply(activeApplyJob._id)}>
                                Submit Application
                            </button>
                            <button className="btn-outline" style={{ padding: '12px 20px' }} onClick={() => { setActiveApplyJob(null); handleRemoveFile(activeApplyJob._id); }}>
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default SeekerDashboard;