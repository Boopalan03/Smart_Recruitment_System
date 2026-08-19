import { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const PostJob = () => {
    // ✅ FIX: State now matches the new Naukri-style Backend Model
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        description: '',
        minSalary: '', 
        maxSalary: '',
        experienceLevel: '', 
        jobType: 'Full-time' 
    });
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/jobs', formData);
            alert('Job Posted Successfully!');
            navigate('/');
        } catch (err) {
            console.error("Error Details:", err.response?.data); // See console for exact error
            alert(err.response?.data?.msg || 'Error posting job. Are you logged in as an Employer?');
        }
    };

    // Styling constants
    const inputStyle = { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.95rem' };
    const labelStyle = { fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '5px' };

    return (
        <div style={{ maxWidth: '700px', margin: '3rem auto', padding: '2.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1e293b', textAlign: 'center' }}>Post a New Job</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={labelStyle}>Job Title</label>
                    <input name="title" placeholder="e.g. Senior React Developer" onChange={handleChange} required style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={labelStyle}>Company Name</label>
                        <input name="company" placeholder="e.g. TechCorp" onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={labelStyle}>Location</label>
                        <input name="location" placeholder="e.g. Bangalore" onChange={handleChange} required style={inputStyle} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={labelStyle}>Min Salary (₹)</label>
                        <input type="number" name="minSalary" placeholder="50000" onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={labelStyle}>Max Salary (₹)</label>
                        <input type="number" name="maxSalary" placeholder="100000" onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={labelStyle}>Experience (Yrs)</label>
                        <input type="number" name="experienceLevel" placeholder="2" onChange={handleChange} required style={inputStyle} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={labelStyle}>Work Mode</label>
                    <select name="jobType" onChange={handleChange} style={inputStyle}>
                        <option value="Full-time">Full-time (Office)</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={labelStyle}>Job Description</label>
                    <textarea name="description" placeholder="Describe roles and responsibilities..." rows="5" onChange={handleChange} required style={{...inputStyle, resize: 'vertical'}} />
                </div>

                <button type="submit" style={{ padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>
                    Publish Job
                </button>
            </form>
        </div>
    );
};

export default PostJob;