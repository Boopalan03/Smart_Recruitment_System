const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Get all users except superadmins
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'superadmin' } }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Verify Employer
exports.verifyEmployer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'employer') {
            return res.status(404).json({ msg: 'Employer not found' });
        }
        user.isVerified = true;
        await user.save();
        res.json({ msg: 'Employer verified successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Unverify Employer
exports.unverifyEmployer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'employer') {
            return res.status(404).json({ msg: 'Employer not found' });
        }
        user.isVerified = false;
        await user.save();
        res.json({ msg: 'Employer unverified successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Block User
exports.blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role === 'superadmin') return res.status(403).json({ msg: 'Cannot block superadmin' });
        
        user.isBlocked = true;
        await user.save();
        res.json({ msg: 'User blocked successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Unblock User
exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.isBlocked = false;
        await user.save();
        res.json({ msg: 'User unblocked successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Delete User and their associated data
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role === 'superadmin') return res.status(403).json({ msg: 'Cannot delete superadmin' });

        // If employer, delete their jobs and applications to those jobs
        if (user.role === 'employer') {
            const jobs = await Job.find({ postedBy: user._id });
            const jobIds = jobs.map(j => j._id);
            await Application.deleteMany({ job: { $in: jobIds } });
            await Job.deleteMany({ postedBy: user._id });
        }

        // If seeker, delete their applications
        if (user.role === 'seeker') {
            await Application.deleteMany({ applicant: user._id });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalSeekers = await User.countDocuments({ role: 'seeker' });
        const totalEmployers = await User.countDocuments({ role: 'employer' });
        const verifiedEmployers = await User.countDocuments({ role: 'employer', isVerified: true });
        const blockedUsers = await User.countDocuments({ isBlocked: true, role: { $ne: 'superadmin' } });
        const totalJobs = await Job.countDocuments();
        const totalApplications = await Application.countDocuments();

        res.json({
            totalSeekers,
            totalEmployers,
            verifiedEmployers,
            blockedUsers,
            totalJobs,
            totalApplications
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
