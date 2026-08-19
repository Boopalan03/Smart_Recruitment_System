const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- EXISTING AUTH FUNCTIONS ---

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, contact, gender, dob } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (role === 'superadmin') {
            return res.status(400).json({ msg: 'Cannot register as superadmin' });
        }
        const assignedRole = role === 'employer' ? 'employer' : 'seeker';
        user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role: assignedRole,
            contact,
            gender,
            dob
        });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, contact: user.contact, gender: user.gender, dob: user.dob } });
    } catch (err) { res.status(500).send('Server Error'); }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
        
        if (user.isBlocked) {
            return res.status(403).json({ msg: 'Your account has been blocked by the administrator' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified } });
    } catch (err) { res.status(500).send('Server Error'); }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ msg: 'Email and new password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ msg: 'Password Reset Successfully' });
    } catch (err) { res.status(500).send('Server Error'); }
};

// --- ✅ NEW PROFILE FUNCTIONS ---

// 1. Get Current User Data
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 2. Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, contact, gender, dob } = req.body;

        // Find user by ID (from Auth Middleware)
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Update fields if provided
        if (name) user.name = name;
        if (contact) user.contact = contact;
        if (gender) user.gender = gender;
        if (dob) user.dob = dob;

        await user.save();

        res.json({ msg: 'Profile Updated Successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 3. Delete User Account
exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        await User.findByIdAndDelete(req.user.id);
        res.json({ msg: 'Account Deleted Successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};