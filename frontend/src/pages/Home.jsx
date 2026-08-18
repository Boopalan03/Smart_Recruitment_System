import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import EmployerDashboard from './EmployerDashboard';
import SeekerDashboard from './SeekerDashboard';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // If logged in, direct away from landing page
    useEffect(() => {
        if (user && user.role === 'employer') {
            navigate('/employer-dashboard');
        }
    }, [user, navigate]);

    if (user) {
        if (user.role === 'employer') {
            return null;
        }
    }

    // If not logged in, show the landing page
    return (
        <>
            <div className="landing-container">
            {/* 1. HERO SECTION */}
            <div className="landing-hero">
                <div className="hero-badge">Smart Job Search</div>
                <h1>Welcome to the <span>Smart Recruitment System</span></h1>
                <p className="hero-text">
                    Connecting talented job seekers with industry-leading employers. Explore job opportunities, upload your resume, and manage your applications effortlessly.
                </p>
                <button 
                    className="btn-primary" 
                    style={{ padding: '12px 30px', fontSize: '1.05rem' }} 
                    onClick={() => {
                        if (user) {
                            if (user.role === 'employer') {
                                navigate('/employer-dashboard');
                            } else {
                                navigate('/dashboard?tab=feed');
                            }
                        } else {
                            navigate('/login');
                        }
                    }}
                >
                    Find & Apply for Jobs →
                </button>
            </div>

            {/* 2. THREE PORTAL PANELS */}
            {!user && (
                <div className="landing-section">
                    <h2 className="section-title">Access Portals</h2>
                    <p className="section-subtitle">Select the appropriate portal panel below to log in or register.</p>
                    
                    <div className="panels-grid">
                        {/* JOB SEEKER PANEL */}
                        <div className="panel-card">
                            <div>
                                <div className="panel-icon">🎓</div>
                                <h3>Job Seeker</h3>
                                <p>Build your professional profile, search through real-time job openings, filter by location and salary, and submit your resume directly.</p>
                            </div>
                            <button className="btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => navigate('/login')}>
                                Job Seeker Portal
                            </button>
                        </div>

                        {/* EMPLOYER PANEL */}
                        <div className="panel-card">
                            <div>
                                <div className="panel-icon">💼</div>
                                <h3>Employer Portal</h3>
                                <p>Find qualified talent for your company. Create detailed job listings, view uploaded resumes, and manage applicant status dynamically.</p>
                            </div>
                            <button className="btn-outline" style={{ width: '100%', marginTop: 'auto' }} onClick={() => navigate('/login')}>
                                Employer Portal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. APPLICATION PROCESS INFO */}
            <div className="landing-section" style={{ marginBottom: '40px' }}>
                <h2 className="section-title">Process for Applying Jobs</h2>
                <p className="section-subtitle">We have simplified job hunting. Follow this quick 4-step process to land your dream job.</p>

                <div className="process-grid">
                    <div className="process-card">
                        <div className="step-num">1</div>
                        <h3>Create Account</h3>
                        <p>Register as a Job Seeker and verify your email using a secure one-time passcode (OTP).</p>
                    </div>

                    <div className="process-card">
                        <div className="step-num">2</div>
                        <h3>Complete Profile</h3>
                        <p>Navigate to "My Account" to complete your contact information, gender, and date of birth details.</p>
                    </div>

                    <div className="process-card">
                        <div className="step-num">3</div>
                        <h3>Filter & Search</h3>
                        <p>Use the Seeker Dashboard to search keywords or filter by job types, locations, and minimum salary range.</p>
                    </div>

                    <div className="process-card">
                        <div className="step-num">4</div>
                        <h3>Upload & Apply</h3>
                        <p>Upload your PDF or Word format resume for a listing and click "Apply" to instantly submit.</p>
                    </div>
                </div>
            </div>
            </div>

            {/* 4. FOOTER */}
            <footer className="landing-footer">
                <div className="footer-container">
                    {/* Brand Col */}
                    <div className="footer-col">
                        <div className="footer-brand-header">
                            <div className="footer-brand-logo">💼</div>
                            <span className="footer-brand-title">Smart Job Portal</span>
                        </div>
                        <p className="footer-brand-desc">
                            An advanced, AI-powered system designed for modern recruitment. Instantly evaluate applications, upload resumes, and perform real-time verification securely and fast.
                        </p>
                        <div className="footer-social-row">
                            <a href="https://www.linkedin.com/in/boopalan-m-03a663292/" target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect x="2" y="9" width="4" height="12"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                            </a>
                            <a href="https://github.com/Boopalan03" target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links Col */}
                    <div className="footer-col">
                        <span className="footer-col-title">Quick Links</span>
                        <ul className="footer-list">
                            <li className="footer-list-item">
                                <span className="footer-caret">&gt;</span>
                                <Link to="/" className="footer-list-link">Home</Link>
                            </li>

                            <li className="footer-list-item">
                                <span className="footer-caret">&gt;</span>
                                <Link to={user ? "/dashboard?tab=feed" : "/register"} className="footer-list-link">
                                    {user ? "Find Jobs" : "Register"}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Features Col */}
                    <div className="footer-col">
                        <span className="footer-col-title">Features</span>
                        <ul className="footer-list">
                            <li className="footer-list-item">
                                <span className="footer-bullet">•</span>
                                <span className="footer-list-link">Smart Job Search</span>
                            </li>
                            <li className="footer-list-item">
                                <span className="footer-bullet">•</span>
                                <span className="footer-list-link">Resume Upload</span>
                            </li>
                            <li className="footer-list-item">
                                <span className="footer-bullet">•</span>
                                <span className="footer-list-link">Application Tracking</span>
                            </li>
                            <li className="footer-list-item">
                                <span className="footer-bullet">•</span>
                                <span className="footer-list-link">Profile Management</span>
                            </li>
                            <li className="footer-list-item">
                                <span className="footer-bullet">•</span>
                                <span className="footer-list-link">OTP Authentication</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Col */}
                    <div className="footer-col">
                        <span className="footer-col-title">Contact</span>
                        <div className="footer-list" style={{ gap: '16px' }}>
                            <div className="footer-contact-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-contact-icon-svg">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <a href="mailto:portaljob54@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>portaljob54@gmail.com</a>
                            </div>
                            <div className="footer-contact-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-contact-icon-svg">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <span>+91 9360655745</span>
                            </div>
                            <div className="footer-contact-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-contact-icon-svg">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>
                                    Coimbatore<br />
                                    Tamil Nadu<br />
                                    India
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom-bar">
                    © {new Date().getFullYear()} Smart Recruitment System. All rights reserved.
                </div>
            </footer>
        </>
    );
};

export default Home;