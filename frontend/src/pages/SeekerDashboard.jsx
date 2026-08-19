import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api';
import CustomModal from '../components/CustomModal';

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

    // ✅ NEW: State for Locations
    const [locationOptions, setLocationOptions] = useState([]);

    const [filters, setFilters] = useState({
        location: '',
        jobType: '',
        minSalary: 0,
        search: ''
    });

    const scrollBoxStyle = {
        maxHeight: '180px',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        border: '1px solid #cbd5e1',
        padding: '10px',
        borderRadius: '6px',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    };

    // Modal Helpers
    const showModal = (type, message) => setModal({ isOpen: true, type, message });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    // ✅ 1. Fetch Locations Dynamically
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await API.get('/jobs/locations');
                // Filter out empty/null locations just in case
                const uniqueLocations = res.data.filter(loc => loc); 
                setLocationOptions(uniqueLocations);
            } catch {
                console.error("Failed to fetch locations");
            }
        };
        fetchLocations();
    }, []); // Runs once on mount

    // 2. Fetch Jobs (Based on Filters)
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

    // 3. Fetch Applications on Mount or View Change
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

    return (
        <div className="container">
            {/* Sidebar is now a floating pop-up inside the search-bar-container */}

            <div className="feed">
                {view === 'feed' && (
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }}>
                        Find My Job
                    </h2>
                )}

                {view === 'feed' && (
                    <div className="search-bar-container" style={{ position: 'relative', zIndex: 10 }}>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="🔍 Search jobs by title, company, or keyword..." 
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                        <button 
                            ref={filterButtonRef}
                            type="button"
                            onClick={() => setShowSidebar(!showSidebar)}
                            style={{
                                background: showSidebar ? '#4f46e5' : 'transparent',
                                border: '1px solid #4f46e5',
                                borderRadius: '8px',
                                padding: '10px 16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: showSidebar ? '#ffffff' : '#4f46e5',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                boxShadow: showSidebar ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none'
                            }}
                        >
                            <span>🎛️</span>
                            <span>Filters</span>
                        </button>

                        {/* POP-UP FILTERS OVERLAY */}
                        {showSidebar && (
                            <div ref={filterRef} className="sidebar" style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                right: 0,
                                zIndex: 999,
                                width: '310px',
                                background: 'white',
                                boxShadow: '0 15px 30px rgba(15, 23, 42, 0.15), 0 5px 15px rgba(15, 23, 42, 0.1)',
                                border: '1px solid #cbd5e1',
                                textAlign: 'left'
                            }}>
                                <div className="filter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Filters</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowSidebar(false)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#64748b' }}
                                    >
                                        ✖
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
                                    <h4>Min Salary: ₹{filters.minSalary}</h4>
                                    <input 
                                        type="range" min="0" max="200000" step="10000"
                                        value={filters.minSalary}
                                        onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
                                    />
                                </div>

                                <div className="filter-group">
                                    <h4>Location</h4>
                                    <div style={scrollBoxStyle}>
                                        {locationOptions.length > 0 ? (
                                            locationOptions.map((loc) => (
                                                <label key={loc} className="checkbox-label" style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={filters.location === loc}
                                                        onChange={() => handleFilterChange('location', loc)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontSize: '14px', color: '#334155' }}>{loc}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <div style={{fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center'}}>Loading...</div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    className="btn-outline" 
                                    style={{width: '100%', marginTop: '10px'}}
                                    onClick={() => setFilters({location: '', jobType: '', minSalary: 0, search: ''})}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'feed' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {jobs.length > 0 ? (
                            jobs.map(job => {
                                const hasApplied = myApplications.some(app => app.job?._id === job._id || app.job === job._id);
                                return (
                                    <div key={job._id} className="job-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 className="job-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{job.title}</h3>
                                            <div className="company-name" style={{ color: '#4f46e5', fontWeight: '600', marginBottom: '12px' }}>
                                                🏢 {job.company} {job.location && `• 📍 ${job.location}`}
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                                                <span className="meta-item" style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
                                                    💰 ₹{typeof job.minSalary === 'number' || typeof job.minSalary === 'string' ? job.minSalary : (job.salary && typeof job.salary === 'object' ? `${job.salary.min || ''} - ${job.salary.max || ''}` : job.salary || 'N/A')}
                                                </span>
                                                <span className="meta-item" style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
                                                    💼 {job.jobType || 'Full-time'}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                            {hasApplied ? (
                                                <span style={{ 
                                                    color: '#16a34a', 
                                                    fontWeight: '600', 
                                                    fontSize: '0.95rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    background: '#f0fdf4',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #bbf7d0',
                                                    justifyContent: 'center'
                                                }}>
                                                    ✅ Applied
                                                </span>
                                            ) : (
                                                <button 
                                                    className="btn-primary" 
                                                    style={{ width: '100%', padding: '10px' }} 
                                                    onClick={() => setActiveApplyJob(job)}
                                                >
                                                    Apply for Job
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-jobs">
                                <h3>No Jobs Found</h3>
                                <p>Try adjusting your search filters.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ... inside SeekerDashboard.jsx ... */}

                {view === 'applications' && (
                    <>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }}>
                            My Applications
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', width: '100%' }}>
                        {myApplications.map(app => (
                            <div 
                                key={app._id} 
                                className="job-card" 
                                style={{ 
                                    marginBottom: '0',
                                    borderLeft: `5px solid ${
                                        app.status === 'accepted' ? '#22c55e' : 
                                        app.status === 'rejected' ? '#ef4444' : '#fbbf24'
                                    }` 
                                }}
                            >
                                <h3 className="job-title">{app.job?.title || 'Job Removed'}</h3>
                                <div className="company-name">{app.job?.company}</div>
                                
                                <div style={{ marginTop: '10px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    
                                    {/* Status Text */}
                                    <div style={{ marginBottom: '5px' }}>
                                        <strong>Status: </strong> 
                                        <span style={{ 
                                            textTransform: 'capitalize', 
                                            fontWeight: 'bold', 
                                            color: app.status === 'accepted' ? '#15803d' : 
                                                app.status === 'rejected' ? '#b91c1c' : '#b45309'
                                        }}>
                                            {app.status}
                                        </span>
                                    </div>

                                    {/* ✅ NEW: Show Message ONLY if Accepted */}
                                    {app.status === 'accepted' && (
                                        <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            📩 <span>You will receive an email shortly regarding next steps.</span>
                                        </div>
                                    )}
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}
            </div>

            <CustomModal isOpen={modal.isOpen} type={modal.type} message={modal.message} onClose={closeModal} />

            {/* JOB APPLICATION MODAL POPUP */}
            {activeApplyJob && (
                <div className="modal-overlay" onClick={() => { setActiveApplyJob(null); handleRemoveFile(activeApplyJob._id); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Apply for {activeApplyJob.title}</h3>
                            <button 
                                type="button" 
                                onClick={() => { setActiveApplyJob(null); handleRemoveFile(activeApplyJob._id); }} 
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
                            >
                                ✖
                            </button>
                        </div>

                        <div style={{ maxHeight: 'calc(80vh - 150px)', overflowY: 'auto', paddingRight: '5px', textAlign: 'left' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ color: '#4f46e5', fontWeight: '700', fontSize: '1.1rem' }}>🏢 {activeApplyJob.company}</span>
                                {activeApplyJob.location && <span style={{ color: '#64748b', fontSize: '1rem', marginLeft: '10px' }}>📍 {activeApplyJob.location}</span>}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                <span className="meta-item" style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
                                    💰 ₹{typeof activeApplyJob.minSalary === 'number' || typeof activeApplyJob.minSalary === 'string' ? activeApplyJob.minSalary : (activeApplyJob.salary && typeof activeApplyJob.salary === 'object' ? `${activeApplyJob.salary.min || ''} - ${activeApplyJob.salary.max || ''}` : activeApplyJob.salary || 'N/A')}
                                </span>
                                <span className="meta-item" style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
                                    💼 {activeApplyJob.jobType || 'Full-time'}
                                </span>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Job Description</h4>
                                <p style={{ fontSize: '0.92rem', color: '#475569', whiteSpace: 'pre-line', lineHeight: '1.6', background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', maxHeight: '200px', overflowY: 'auto' }}>
                                    {activeApplyJob.description}
                                </p>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '10px' }}>Upload Your Resume</h4>
                                
                                <div className="file-upload-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
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
                                    <label id={`file-label-${activeApplyJob._id}`} htmlFor={`file-input-${activeApplyJob._id}`} className="custom-file-btn" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '12px', cursor: 'pointer' }}>
                                        📁 Upload Resume
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                        <span id={`file-name-${activeApplyJob._id}`} className="file-name-display" style={{ fontSize: '0.82rem', color: '#64748b' }}>No file chosen</span>
                                        <button id={`remove-btn-${activeApplyJob._id}`} type="button" className="remove-file-btn" onClick={() => handleRemoveFile(activeApplyJob._id)} style={{ display: 'none' }}>✖</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '12px', marginTop: '25px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                            <button className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '1rem' }} onClick={() => handleApply(activeApplyJob._id)}>
                                Submit Application
                            </button>
                            <button className="btn-outline" style={{ padding: '12px 20px', fontSize: '1rem' }} onClick={() => { setActiveApplyJob(null); handleRemoveFile(activeApplyJob._id); }}>
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}

            <CustomModal isOpen={modal.isOpen} type={modal.type} message={modal.message} onClose={closeModal} />
        </div>
    );
};

export default SeekerDashboard;