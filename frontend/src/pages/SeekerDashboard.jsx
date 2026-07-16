import { useState, useEffect } from 'react';
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

    // Sync tab param from URL to the local view state
    useEffect(() => {
        setView(tab);
    }, [tab]);

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

    // 3. Fetch Applications
    useEffect(() => {
        if (view === 'applications') {
            const fetchMyApps = async () => {
                try { 
                    const res = await API.get('/jobs/my-applications'); 
                    setMyApplications(res.data); 
                } catch (err) { console.error(err); }
            };
            fetchMyApps();
        }
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
        } catch (err) {
            const msg = err.response?.data?.msg || err.response?.data || 'Server Error';
            showModal('error', `❌ Application Failed: ${msg}`);
        }
    };

    return (
        <div className="container">
            {view === 'feed' && (
                <div className="sidebar">
                    <div className="filter-header">Filters</div>

                    <div className="filter-group">
                        <h4>Search</h4>
                        <input 
                            type="text" className="search-input" placeholder="Keyword..." 
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
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
                        {/* ✅ DYNAMIC LOCATION LIST */}
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

            <div className="feed">


                {view === 'feed' && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {jobs.length > 0 ? (
                            jobs.map(job => (
                                <div key={job._id} className="job-card">
                                    <h3 className="job-title">{job.title}</h3>
                                    <div className="company-name">{job.company} - {job.location}</div>
                                    <p className="job-desc">{job.description?.substring(0, 150)}...</p>

                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                        <div className="job-meta">
                                            <span className="meta-item">💰 ₹{typeof job.minSalary === 'number' || typeof job.minSalary === 'string' ? job.minSalary : (job.salary && typeof job.salary === 'object' ? `${job.salary.min || ''} - ${job.salary.max || ''}` : job.salary || 'N/A')}</span>
                                            <span className="meta-item">💼 {job.jobType || 'Full-time'}</span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="file-upload-wrapper">
                                                <input 
                                                    id={`file-input-${job._id}`}
                                                    type="file" accept=".pdf,.doc,.docx" className="hidden-input"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        setSelectedResume(file);
                                                        const label = document.getElementById(`file-label-${job._id}`);
                                                        const nameSpan = document.getElementById(`file-name-${job._id}`);
                                                        const removeBtn = document.getElementById(`remove-btn-${job._id}`);

                                                        if (file) {
                                                            label.classList.add('selected');
                                                            nameSpan.textContent = file.name;
                                                            removeBtn.style.display = "inline-block";
                                                        } else {
                                                            handleRemoveFile(job._id);
                                                        }
                                                    }}
                                                />
                                                <label id={`file-label-${job._id}`} htmlFor={`file-input-${job._id}`} className="custom-file-btn">
                                                    📁 Upload Resume
                                                </label>
                                                <span id={`file-name-${job._id}`} className="file-name-display">No file chosen</span>
                                                <button id={`remove-btn-${job._id}`} type="button" className="remove-file-btn" onClick={() => handleRemoveFile(job._id)}>✖</button>
                                            </div>

                                            <button className="btn-primary" onClick={() => handleApply(job._id)}>Apply</button>
                                        </div>
                                    </div>
                                </div>
                            ))
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
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {myApplications.map(app => (
                            <div 
                                key={app._id} 
                                className="job-card" 
                                style={{ 
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
                )}
            </div>

            <CustomModal isOpen={modal.isOpen} type={modal.type} message={modal.message} onClose={closeModal} />
        </div>
    );
};

export default SeekerDashboard;