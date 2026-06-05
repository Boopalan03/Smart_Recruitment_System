const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import the file you just made
const { uploadResume } = require('../controllers/userController');

// Route: POST /api/users/upload-resume
// 'resume' is the key name expected in the form-data
router.post('/upload-resume', auth, upload.single('resume'), uploadResume);

module.exports = router;