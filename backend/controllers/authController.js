const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// --- EXISTING AUTH FUNCTIONS ---

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'User already registered' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.findOneAndUpdate({ email }, { otp, createdAt: Date.now() }, { upsert: true, new: true });
        await sendEmail(email, otp);

        res.json({ msg: 'OTP sent successfully' });
    } catch (err) { res.status(500).send('Server Error'); }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, otp, role } = req.body;
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ msg: 'Invalid or Expired OTP' });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const assignedRole = role === 'employer' ? 'employer' : 'seeker';
        user = new User({ name, email, password: hashedPassword, role: assignedRole });
        await user.save();
        await Otp.deleteOne({ email });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) { res.status(500).send('Server Error'); }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) { res.status(500).send('Server Error'); }
};

exports.createEmployer = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({ name, email, password: hashedPassword, role: 'employer' });
        await user.save();
        res.json({ msg: 'Employer Created', user });
    } catch (err) { res.status(500).send('Server Error'); }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.findOneAndUpdate({ email }, { otp, createdAt: Date.now() }, { upsert: true, new: true });
        await sendEmail(email, otp);

        res.json({ msg: 'OTP sent to email' });
    } catch (err) { res.status(500).send('Server Error'); }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ msg: 'Invalid OTP' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        await Otp.deleteOne({ email });

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