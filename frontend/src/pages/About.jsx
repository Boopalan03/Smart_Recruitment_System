import { useNavigate } from 'react-router-dom';

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            {/* 1. HERO SECTION */}
            <div className="landing-hero" style={{ padding: '60px 40px' }}>
                <div className="hero-badge">About Our Platform</div>
                <h1>Empowering Connections via the <br /><span>Smart Recruitment System</span></h1>
                <p className="hero-text" style={{ fontSize: '1.1rem', marginBottom: '24px' }}>
                    We bridge the gap between talented individuals and leading organizations. By offering structured workspaces, secure application flows, and intuitive profile controls, we make recruitment simple, fast, and transparent.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button className="btn-primary" onClick={() => navigate('/login')}>
                        Get Started
                    </button>
                    <button className="btn-outline" onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                </div>
            </div>

            {/* 2. THE MISSION / VALUES */}
            <div className="landing-section">
                <h2 className="section-title">Our Core Pillars</h2>
                <p className="section-subtitle">The foundation of how we build and maintain our recruitment experience.</p>
                
                <div className="process-grid">
                    <div className="process-card">
                        <div className="step-num">🎯</div>
                        <h3>Efficiency</h3>
                        <p>Say goodbye to long wait times. Our direct submission structure ensures employers receive applications instantly.</p>
                    </div>

                    <div className="process-card">
                        <div className="step-num">🔒</div>
                        <h3>Security</h3>
                        <p>Equipped with secure authentication and protected routing, your personal details and resumes remain safe.</p>
                    </div>

                    <div className="process-card">
                        <div className="step-num">⚡</div>
                        <h3>Simplicity</h3>
                        <p>An easy-to-use control panel allows seekers and employers to handle complex actions with a few simple clicks.</p>
                    </div>

                    <div className="process-card">
                        <div className="step-num">📊</div>
                        <h3>Transparency</h3>
                        <p>Real-time status updates allow applicants to track the progress of their applications at every stage.</p>
                    </div>
                </div>
            </div>

            {/* 3. WHO IS IT FOR? */}
            <div className="landing-section" style={{ marginBottom: '60px' }}>
                <h2 className="section-title">A Portal Engineered For Everyone</h2>
                <p className="section-subtitle">Tailored experiences built specifically for different recruitment workflows.</p>

                <div className="panels-grid">
                    {/* FOR JOB SEEKERS */}
                    <div className="panel-card">
                        <div>
                            <div className="panel-icon">🎓</div>
                            <h3>For Job Seekers</h3>
                            <p>
                                Create an account in seconds, set up a detailed profile with contact details, upload your professional resume, and apply to jobs that match your skillset using our advanced search filters.
                            </p>
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => navigate('/register')}>
                            Create Seeker Account
                        </button>
                    </div>

                    {/* FOR EMPLOYERS */}
                    <div className="panel-card">
                        <div>
                            <div className="panel-icon">💼</div>
                            <h3>For Employers</h3>
                            <p>
                                Post job listings in real-time, customize compensation and descriptions, view candidate profiles, download their submitted resumes, and update applicant statuses dynamically to optimize your hiring funnel.
                            </p>
                        </div>
                        <button className="btn-outline" style={{ width: '100%', marginTop: 'auto' }} onClick={() => navigate('/login')}>
                            Employer Console
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
