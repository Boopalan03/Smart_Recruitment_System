const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const { 
    getJobs, 
    createJob, 
    applyForJob, 
    getUserApplications, 
    getMyPostedJobs, 
    getApplicationsForJob, 
    updateApplicationStatus, 
    getJobLocations,
    getAllEmployerApplications,
    deleteJob,
    getNotifications,
    deleteNotification
} = require('../controllers/jobController');

// --- PUBLIC ROUTES ---
router.get('/', getJobs);
router.get('/locations', getJobLocations); // Must be before /:id to prevent conflicts

// --- SEEKER ROUTES ---
router.get('/notifications', auth, getNotifications);
router.delete('/notifications/:id', auth, deleteNotification);
router.post('/:id/apply', auth, upload.single('resume'), applyForJob);
router.get('/my-applications', auth, getUserApplications);

// --- EMPLOYER ROUTES ---
router.post('/', auth, createJob);
router.get('/employer/my-jobs', auth, getMyPostedJobs);
router.get('/employer/applications/:jobId', auth, getApplicationsForJob);
router.put('/application/:id/status', auth, updateApplicationStatus);
router.get('/employer/all-applications', auth, getAllEmployerApplications); // Global Message Inbox
router.delete('/:id', auth, deleteJob);

module.exports = router;