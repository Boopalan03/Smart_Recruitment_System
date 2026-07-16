const Job = require('../models/Job');
const Application = require('../models/Application');

// 1. Get Jobs (Public Feed with Filters)
exports.getJobs = async (req, res) => {
    try {
        const { search, location, minSalary, jobType } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (location) query.location = { $regex: location, $options: 'i' };
        if (minSalary) query.minSalary = { $gte: Number(minSalary) };
        if (jobType) query.jobType = { $regex: jobType, $options: 'i' };

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 2. Get Unique Locations (For dynamic filter list)
exports.getJobLocations = async (req, res) => {
    try {
        const locations = await Job.distinct('location');
        res.json(locations);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 3. Create Job (Employer)
exports.createJob = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ msg: 'Access denied. Employers only.' });
        }
        const newJob = new Job({ ...req.body, postedBy: req.user.id });
        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 4. Apply for Job (Seeker) - Includes File Upload Fix
exports.applyForJob = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!req.file) return res.status(400).json({ msg: 'Please upload a resume' });

        const existing = await Application.findOne({ job: id, applicant: userId });
        if (existing) return res.status(400).json({ msg: 'You have already applied for this job' });

        // Save only relative path so frontend can access it cleanly
        const relativePath = 'uploads/' + req.file.filename;

        const newApplication = new Application({
            job: id,
            applicant: userId,
            status: 'pending',
            resume: relativePath 
        });

        await newApplication.save();
        res.json({ msg: 'Application successful' });
    } catch (err) {
        console.error("Apply Error:", err);
        res.status(500).send('Server Error: ' + err.message);
    }
};

// 5. Get User Applications (Seeker)
exports.getUserApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .populate('job', 'title company location description');
        res.json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 6. Get My Posted Jobs (Employer)
exports.getMyPostedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 7. Get Applications for Specific Job (Employer)
exports.getApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findOne({ _id: jobId, postedBy: req.user.id });
        if (!job) return res.status(403).json({ msg: 'Not authorized to view these applications' });

        const applications = await Application.find({ job: jobId })
            .populate('applicant', 'name email');
            
        res.json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 8. Update Application Status (Employer)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body; 
        const application = await Application.findById(req.params.id);
        
        if (!application) return res.status(404).json({ msg: 'Application not found' });

        application.status = status;
        await application.save();
        res.json(application);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 9. Get ALL Applications for Global Inbox (Employer)
exports.getAllEmployerApplications = async (req, res) => {
    try {
        const myJobs = await Job.find({ postedBy: req.user.id }).select('_id');
        const jobIds = myJobs.map(job => job._id);

        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('applicant', 'name email')
            .populate('job', 'title') 
            .sort({ createdAt: -1 }); 

        res.json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 10. Delete Job (Employer)
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check user authorization (must be the employer who posted it)
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to delete this job' });
        }

        // Delete all applications related to this job
        await Application.deleteMany({ job: id });

        // Delete the job itself
        await Job.findByIdAndDelete(id);

        res.json({ msg: 'Job and all its applications deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};