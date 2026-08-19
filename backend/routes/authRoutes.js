const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // ✅ Import Middleware
const { 
    register, login, createEmployer, 
    resetPassword,
    getMe, updateProfile, deleteAccount // ✅ Import New Controllers
} = require('../controllers/authController');

// Auth Flow
router.post('/register', register);
router.post('/login', login);

// Password Reset
router.post('/reset-password', resetPassword);

// Admin
router.post('/admin/create-employer', createEmployer);

// ✅ NEW PROFILE ROUTES (Protected)
router.get('/me', auth, getMe);           // Get user details
router.put('/update-profile', auth, updateProfile); // Update details
router.delete('/delete-account', auth, deleteAccount); // Delete user account

module.exports = router;