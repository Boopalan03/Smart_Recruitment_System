const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    
    // ✅ ADD THESE NEW FIELDS
    minSalary: { type: Number, required: true },
    maxSalary: { type: Number, required: true },
    experienceLevel: { type: Number, required: true },
    jobType: { type: String, required: true }, // Stores 'Remote', 'Full-time', etc.
    
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);