const User = require('../models/User');

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        // Update user profile with the file path
        const user = await User.findById(req.user.id);
        user.resume = req.file.path; // Save the path, e.g., "uploads/resume-123.pdf"
        await user.save();

        res.json({ msg: 'Resume uploaded successfully', filePath: req.file.path });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};