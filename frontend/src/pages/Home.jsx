import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmployerDashboard from './EmployerDashboard';
import SeekerDashboard from './SeekerDashboard';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // If logged in, direct away from landing page
    if (user) {
        if (user.role === 'employer') {
            return <EmployerDashboard />;
        }
        return <SeekerDashboard />;
    }

    // If not logged in, show the landing page
    return (
        <div className="landing-container">
            {/* 1. HERO SECTION */}
            <div className="landing-hero">
                <div className="hero-badge">Smart Job Search</div>
                <h1>Welcome to the <span>Smart Recruitment System</span></h1>
                <p className="hero-text">
                    Connecting talented job seekers with industry-leading employers. Explore job opportunities, upload your resume, and manage your applications effortlessly.
                </p>
                <button className="btn-primary" style={{ padding: '12px 30px', fontSize: '1.05rem' }} onClick={() => navigate('/login')}>
                    Find & Apply for Jobs →
                </button>
            </div>

            {/* 2. THREE PORTAL PANELS */}
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
    );
};

export default Home;